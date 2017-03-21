'use strict';

var assert = require('proclaim');
var sinon = require('sinon');
var mockery = require('mockery');

var moduleName = '../../../lib/error-pages';

describe('Templating error pages', function() {
	var config;
	var contentType;
	var createFilter;
	var filter;
	var req;
	var res;
	var error;
	var renderer;

	beforeEach(function() {
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
					404: 'layout',
					default: 'layout'
				},
				staticData: {
					appData: {
						siteName: 'Manuscript Transfers'
					},
					brand: 'springer',
					page_meta: [ ],
					page_links: [ ],
					language: 'en',
					containers: {
						top: [
							{
								type: 'header',
								id: 'header',
								data: { }
							}
						],
						middle: [
							{
								type: 'error'
							}
						],
						bottom: [
							{
								type: 'footer',
								id: 'footer',
								data: { }
							}
						]
					}
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
	});
	afterEach(function() {
		mockery.deregisterAll();
		mockery.disable();
	});

	error = new Error('Some kind of error');
	error.status = 418;

	it('Should call the callback with an undefined param if not configured to use templated pages', function() {
		var unconfiguredConfig = config;
		unconfiguredConfig.errorPages = {};

		var errorPages = require(moduleName)(unconfiguredConfig);
		var retval = false;
		errorPages.getPage(error, '', req, res, function(ret) {
			retval = ret;
		});
		assert.isTrue(renderer.render.notCalled);
		assert.strictEqual(undefined, retval);
	});

	it('Should try to render if configured to do so', function() {
		var errorPages = require(moduleName)(config);
		var retval = false;
		errorPages.getPage(error, '', req, res, function(ret) {
			retval = ret;
		});

		renderer.render.firstCall.yield(null, 'my error page');

		assert.strictEqual(renderer.render.callCount, 1);
		assert.strictEqual('my error page', retval);
	});

	it('Should callback with an undefined if there is an error rendering the error page', function() {
		var errorPages = require(moduleName)(config);
		var retval = false;
		errorPages.getPage(error, '', req, res, function(ret) {
			retval = ret;
		});

		renderer.render.firstCall.yield(new Error('bad times'));

		assert.strictEqual(renderer.render.callCount, 1);
		assert.strictEqual(undefined, retval);
	});

	it('Should populate the template with the error context', function() {
		var errorPages = require(moduleName)(config);
		errorPages.getPage(error, '', req, res, function() { });
		assert.strictEqual('layout', renderer.render.firstCall.args[2].layout.template);
		assert.strictEqual(error, renderer.render.firstCall.args[2].errorContext.error);
	});
});
