'use strict';

var assert = require('proclaim');
var sinon = require('sinon');
var mockery = require('mockery');

describe('Worker process running in production', function () {
	var benchmark = null;
	var connect = null;
	/* eslint-disable no-unused-vars */
	var worker = null;
	/* eslint-enable no-unused-vars */
	var renderer = null;
	var processor = null;
	var isProduction = null;
	var isDevelopment = null;
	var config;

	var MAX_POST_SIZE = 100000;
	var PORT = 1337;

	before(function () {
		isProduction = sinon.stub().returns(true);
		isDevelopment = sinon.stub().returns(false);

		config = {
			path: {
				root: '/',
				public: '/path/to/public',
				tests: '/path/to/tests'
			},
			web: {
				resources: '/resources',
				public: '/public',
				tests: '/tests'
			},
			argv: {
				'max-child-processes': 5,
				'max-post-size': MAX_POST_SIZE,
				port: PORT
			},
			log: require('../mocks/log'),
			middleware: [
				['foo', function () {}],
				[function () {}]
			],
			env: {
				name: 'production',
				isProduction: isProduction,
				isDevelopment: isDevelopment
			}
		};

		renderer = require('../mocks/renderer');
		processor = require('../mocks/processor');
		benchmark = require('../mocks/benchmark');

		sinon.spy(process, 'on');
		sinon.stub(process, 'exit');

		mockery.enable({
			useCleanCache: true,
			warnOnUnregistered: false,
			warnOnReplace: false
		});
		mockery.registerMock('path', require('../mocks/path'));
		mockery.registerMock('connect', require('../mocks/connect'));
		mockery.registerMock('body-parser', {json: sinon.stub().returns('JSON')});
		mockery.registerMock('cookie-parser', sinon.stub().returns('COOKIE'));
		mockery.registerMock('serve-static', sinon.stub());
		mockery.registerMock('qs-middleware', sinon.stub().returns('QUERY'));
		mockery.registerMock('./renderer', renderer);
		mockery.registerMock('./processor', processor);
		mockery.registerMock('./benchmark', benchmark);

		connect = require('connect');

		worker = require('../../../lib/worker')(config);
	});
	after(function () {
		mockery.deregisterAll();
		mockery.disable();
		process.on.restore();
		process.exit.restore();
	});
	afterEach(function () {
		process.exit.resetHistory();
		config.log.debug.resetHistory();
	});

	it('Should listen for exit messages', function () {
		assert.isTrue(process.on.calledWith('message'));
		process.on.withArgs('message').yield('force exit');
		assert.isTrue(process.exit.calledOnce);
		assert.isTrue(process.exit.calledWith(0));
	});

	it('Should do nothing if it receives any other message', function () {
		assert.isTrue(process.on.calledWith('message'));
		process.on.withArgs('message').yield('foo');
		assert.isTrue(process.exit.notCalled);
	});

	it('Should handle unexpected exceptions', function () {
		assert.isTrue(process.on.calledWith('uncaughtException'));
	});

	it('Should gracefully exit if there is an EADDRINUSE exception to prevent respawning the worker', function () {
		process.on.withArgs('uncaughtException').yield({code: 'EADDRINUSE'});
		assert(process.exit.calledWith(0));
	});

	it('Should exit with a non-zero status for other cases', function () {
		process.on.withArgs('uncaughtException').yield({code: 'SOMEERROR'});
		assert(process.exit.calledWith(1));
	});

	it('Should listen for the disconnect event', function () {
		assert.isTrue(process.on.calledWith('disconnect'));
		process.on.withArgs('disconnect').yield();
		assert.isTrue(process.exit.calledOnce, 'called once');
		assert.isTrue(process.exit.calledWith(0), 'called with 0');
	});

	it('Should load dust helpers', function () {
		assert.isTrue(renderer().initDustExtensions.calledOnce);
	});

	it('Should pre-compile templates', function () {
		assert.isTrue(renderer().compileTemplates.calledOnce);
	});

	it('Should not watch for template changes', function () {
		assert.isTrue(renderer().watchTemplates.notCalled);
	});

	it('Should not watch for helper changes', function () {
		assert.isTrue(renderer().watchDustExtensions.notCalled);
	});

	it('Should add a middleware to pass the deploy timestamp to the backend', function () {
		assert.isTrue(connect().use.calledWith(processor().timestamp));
	});

	it('Should add a middleware to intercept responses from the backend', function () {
		assert.isTrue(connect().use.calledWith(processor().intercept));
	});

	it('Should add a middleware to hook up the http proxy', function () {
		assert.isTrue(connect().use.calledWith(processor().proxy));
	});

	it('Should mount all additional middleware found in the config', function () {
		assert.isTrue(connect().use.calledWithExactly(config.middleware[0][0], config.middleware[0][1]));
		assert.isTrue(connect().use.calledWithExactly(config.middleware[1][0]));
	});

	it('Should set up a ping end point', function () {
		assert.isTrue(connect().use.calledWith('/ping', processor().ping));
	});

	it('Should set up an end point for the template api', function () {
		assert.isTrue(connect().use.calledWith('/template', processor().api));
	});

	it('Should configure the body parser to be used with the template api', function () {
		assert.isTrue(connect().use.calledWith('/template', 'JSON'));
		assert.isTrue(require('body-parser').json.calledOnce);
		assert.strictEqual(require('body-parser').json.firstCall.args[0].limit, MAX_POST_SIZE);
	});

	it('Should load the appropriate assets in production mode', function () {
		assert.isTrue(connect().use.calledWith('/public'));
		assert.isTrue(require('serve-static').calledWith('/path/to/public'));
		assert.isTrue(renderer().assetServer.notCalled);
	});

	it('Should parse query parameters', function () {
		assert.isTrue(require('qs-middleware').calledOnce);
		assert.strictEqual(require('qs-middleware').firstCall.args[0].allowDots, false);
		assert.isTrue(connect().use.calledWith('QUERY'));
	});

	it('Should parse cookies', function () {
		assert.isTrue(connect().use.calledWith('COOKIE'));
	});

	it('Should listen on the specified port', function () {
		assert.isTrue(connect().listen.calledOnce);
		assert.isTrue(connect().listen.calledWith(PORT));
	});

	it('Should log a message on start up', function () {
		connect().listen.firstCall.yield();
		assert.isTrue(config.log.debug.calledOnce);
	});
});

describe('Worker process running outside of production', function () {
	var benchmark = null;
	var connect = null;
	/* eslint-disable no-unused-vars */
	var worker = null;
	/* eslint-enable no-unused-vars */
	var renderer = null;
	var processor = null;
	var isProduction = null;
	var isDevelopment = null;

	var MAX_POST_SIZE = 100000;
	var PORT = 1337;

	before(function () {
		renderer = require('../mocks/renderer');
		processor = require('../mocks/processor');
		benchmark = require('../mocks/benchmark');

		isProduction = sinon.stub().returns(false);
		isDevelopment = sinon.stub().returns(true);

		sinon.spy(process, 'on');

		mockery.enable({
			useCleanCache: true,
			warnOnUnregistered: false,
			warnOnReplace: false
		});

		mockery.registerMock('path', require('../mocks/path'));
		mockery.registerMock('connect', require('../mocks/connect'));
		mockery.registerMock('body-parser', {json: sinon.stub().returns('JSON')});
		mockery.registerMock('cookie-parser', sinon.stub().returns('COOKIE'));
		mockery.registerMock('serve-static', sinon.stub());
		mockery.registerMock('./query', sinon.stub().returns('QUERY'));
		mockery.registerMock('./renderer', renderer);
		mockery.registerMock('./processor', processor);
		mockery.registerMock('./benchmark', benchmark);

		connect = require('connect');

		worker = require('../../../lib/worker')({
			path: {
				root: '/',
				tests: '/path/to/tests'
			},
			web: {
				resources: '/resources',
				public: '/public',
				tests: '/tests'
			},
			argv: {
				'max-child-processes': 5,
				'max-post-size': MAX_POST_SIZE,
				port: PORT
			},
			middleware: [],
			env: {
				name: 'development',
				isProduction: isProduction,
				isDevelopment: isDevelopment
			}
		});
	});
	after(function () {
		mockery.deregisterAll();
		mockery.disable();
		process.on.restore();
	});

	it('Should load the appropriate assets outside of production', function () {
		assert.isTrue(isProduction.calledOnce);
		assert.isTrue(connect().use.calledWith('/resources'));
		assert.isTrue(require('serve-static').calledOnce);
		assert.isTrue(require('serve-static').firstCall.calledWith('/path/to/tests'));
		assert.isTrue(renderer().assetServer.calledOnce);
	});

	it('Should watch the template directory for changes', function () {
		assert.isTrue(renderer().watchTemplates.calledOnce);
	});

	it('Should watch the helper directory for changes', function () {
		assert.isTrue(renderer().watchDustExtensions.calledOnce);
	});
});
