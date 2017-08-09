'use strict';

var assert = require('proclaim');
var sinon = require('sinon');
var mockery = require('mockery');

var moduleName = '../../../lib/error-pages';

describe('Templating error pages', function () {
	var config;
	var contentType;
	var createFilter;
	var filter;
	var req;
	var res;
	var error;
	var renderer;

	beforeEach(function () {
		mockery.enable({
			useCleanCache: true,
			warnOnUnregistered: false,
			warnOnReplace: false
		});

		contentType = sinon.stub().returns('text/html; charset=utf-8');

		filter = sinon.stub().returnsArg(0);
		createFilter = sinon.stub().returns(filter);
		var rendererLib = require('../mocks/renderer');

		mockery.registerMock('./output-filter', createFilter);
		req = require('../mocks/request');
		req.url = '/hello';
		mockery.registerMock('./content-type', contentType);
		res = require('../mocks/response');

		mockery.registerMock('path', require('../mocks/path'));
		mockery.registerMock('mincer', require('../mocks/mincer'));
		mockery.registerMock('each-module', require('../mocks/each-module'));
		mockery.registerMock('./renderer', rendererLib);

		renderer = rendererLib({});

		config = {
			argv: {},
			log: require('../mocks/log'),
			timer: sinon.stub().returns(sinon.stub()),
			env: {
				isDevelopment: sinon.stub().returns(false),
				isProduction: sinon.stub().returns(true),
				tier: sinon.stub().returns('ci'),
				host: sinon.stub().returns('ci')
			},
			errorPages: {
				errorLayouts: {
					404: 'layout-404',
					default: 'layout-default'
				},
				staticData: {
					users: 'data'
				}
			},
			path: {
				root: '/',
				resources: '/resources',
				publicResources: '/public/resources',
				themes: '/themes',
				templates: '/view',
				dust: '/dust'
			},
			modules: [
				'shunter'
			],
			structure: {
				resources: 'resources',
				styles: 'css',
				images: 'img',
				scripts: 'js',
				fonts: 'fonts',
				templates: 'view',
				dust: 'dust',
				templateExt: '.dust',
				filters: 'filters',
				filtersInput: 'input',
				ejs: 'ejs',
				mincer: 'mincer'
			}
		};

		error = new Error('Some kind of error');
		error.status = 418;
	});
	afterEach(function () {
		mockery.deregisterAll();
		mockery.disable();
	});

	it('Should callback with null if not configured to use templated pages', function () {
		var unconfiguredConfig = config;
		unconfiguredConfig.errorPages = {};
		var errorPages = require(moduleName)(unconfiguredConfig);
		var result = false;
		errorPages.getPage(error, req, res, function (arg) {
			result = arg;
		});

		assert.isTrue(renderer.render.notCalled);
		assert.strictEqual(result, null);
	});

	it('Should try to render if configured to do so', function () {
		var errorPages = require(moduleName)(config);
		var result = false;
		errorPages.getPage(error, req, res, function (arg) {
			result = arg;
		});

		renderer.render.firstCall.yield(null, 'my error page');

		assert.strictEqual(renderer.render.callCount, 1);
		assert.strictEqual(result, 'my error page');
	});

	it('Should callback with null if there is an error rendering the error page', function () {
		var errorPages = require(moduleName)(config);
		var result = false;
		errorPages.getPage(error, req, res, function (arg) {
			result = arg;
		});

		renderer.render.firstCall.yield(new Error('renderer.render threw some error'));

		assert.strictEqual(renderer.render.callCount, 1);
		assert.strictEqual(result, null);
	});

	it('Should callback with null if error falsy', function () {
		var errorPages = require(moduleName)(config);
		var result = false;
		var error;
		errorPages.getPage(error, req, res, function (arg) {
			result = arg;
		});

		assert.strictEqual(result, null);
	});

	it('Should render if provided err.status falsy', function () {
		var errorPages = require(moduleName)(config);
		var result = false;
		error.status = undefined;
		errorPages.getPage(error, req, res, function (arg) {
			result = arg;
		});

		renderer.render.firstCall.yield(null, 'my error page');

		assert.strictEqual(renderer.render.callCount, 1);
		assert.strictEqual(result, 'my error page');
	});

	it('Should render the template with the users specified default layout', function () {
		var errorPages = require(moduleName)(config);
		errorPages.getPage(error, req, res, function () { });
		assert.strictEqual(renderer.render.firstCall.args[2].layout.template, config.errorPages.errorLayouts.default);
	});

	it('Should render the template with the users specified layout by error code', function () {
		var errorPages = require(moduleName)(config);
		var error = new Error('err');
		error.status = 404;
		errorPages.getPage(error, req, res, function () { });
		assert.strictEqual(renderer.render.firstCall.args[2].layout.template, config.errorPages.errorLayouts[error.status.toString()]);
	});

	it('Should insert the error into the template context', function () {
		var errorPages = require(moduleName)(config);
		errorPages.getPage(error, req, res, function () { });
		assert.strictEqual(renderer.render.firstCall.args[2].errorContext.error, error);
	});

	it('Should populate the template context with the reqHost', function () {
		var errorPages = require(moduleName)(config);
		errorPages.getPage(error, req, res, function () { });
		assert.strictEqual(renderer.render.firstCall.args[2].errorContext.reqHost, req.headers.host);
	});

	it('Should populate the template context with the users static data', function () {
		var errorPages = require(moduleName)(config);
		errorPages.getPage(error, req, res, function () { });
		assert.strictEqual(renderer.render.firstCall.args[2].users, config.errorPages.staticData.users);
	});

	it('Should prevent the user from clobbering the required "layout" key', function () {
		config.errorPages.staticData.layout = {};
		var errorPages = require(moduleName)(config);
		errorPages.getPage(error, req, res, function () { });
		assert.strictEqual(renderer.render.firstCall.args[2].layout.template, config.errorPages.errorLayouts.default);
	});

	it('Should prevent the user from clobbering the required "errorContext" key', function () {
		var badConfig = {
			user: 'error'
		};
		config.errorPages.staticData.errorContext = badConfig;
		var errorPages = require(moduleName)(config);
		errorPages.getPage(error, req, res, function () { });
		assert.notStrictEqual(renderer.render.firstCall.args[2].errorContext, badConfig);
	});
});
