'use strict';

var assert = require('proclaim');

var moduleName = '../../../lib/router';
var config;

describe('Proxy routing', function() {
	beforeEach(function() {
		config = {};
		config.routes = {
			localhost: {
				'/\\/test\\/.*/': {
					host: 'test-www.nature.com',
					port: 80
				},
				'/\\/test\\/foo/': {
					host: 'test-www.nature.com',
					port: 81
				},
				'/\\/foo\\/bar/': {
					host: 'staging-www.nature.com',
					port: 82
				},
				capybara: {
					host: 'test-capybara',
					port: 22789
				},
				default: {
					host: '127.0.0.1',
					port: 5410
				}
			}
		};
		config.argv = {
			'route-config': ''
		};
		config.log = require('../mocks/log');
	});

	afterEach(function() {
		config = {};
	});

	it('Should create a routes object from config objects\'s contents', function() {
		config.routes = {
			localhost: {
				'/foo/': 'bar'
			}
		};
		var router = require(moduleName)(config);
		var route1 = router.map('localhost', 'foo');
		assert.equal(route1, 'bar');
	});

	it('Should get the route from the given host if possible', function() {
		config.routes = {
			'www.nature.com': {
				'/foo/': 'success'
			},
			localhost: {
				'/foo/': 'fail'
			}
		};
		var router = require(moduleName)(config);
		var route1 = router.map('www.nature.com', 'foo');
		assert.equal(route1, 'success');
	});

	it('Should ignore the port 80', function() {
		config.routes = {
			'www.nature.com': {
				'/foo/': 'success'
			},
			localhost: {
				'/foo/': 'fail'
			}
		};
		var router = require(moduleName)(config);
		var route1 = router.map('www.nature.com:80', 'foo');
		assert.equal(route1, 'success');
	});

	it('Should fallback to localhost if the host doesn\'t match', function() {
		config.routes = {
			'www.nature.com': {
				'/foo/': 'fail'
			},
			localhost: {
				'/foo/': 'success'
			}
		};
		var router = require(moduleName)(config);
		var route1 = router.map('test-www.nature.com', 'foo');
		assert.equal(route1, 'success');
	});

	it('Should return null if the host doesn\'t match and no localhost routes are defined', function() {
		config.routes = {
			'www.nature.com': {
				'/foo/': 'fail'
			}
		};
		var router = require(moduleName)(config);
		var route = router.map('test-www.nature.com', 'foo');
		assert.isNull(route);
	});

	it('Should map a url to the first matched rule', function() {
		var router = require(moduleName)(config);
		var route1 = router.map('localhost', '/test/foo');
		assert.equal(route1.host, 'test-www.nature.com');
		assert.equal(route1.port, 80);
		var route2 = router.map('localhost', '/foo/bar');
		assert.equal(route2.host, 'staging-www.nature.com');
		assert.equal(route2.port, 82);
	});

	it('Should map a url that doesn\'t match any of the rules to the default', function() {
		var route = require(moduleName)(config).map('localhost', '/');
		assert.equal(route.host, '127.0.0.1');
		assert.equal(route.port, 5410);
	});

	it('Should allow the default route to be configured', function() {
		config.argv = {
			'route-config': 'capybara'
		};
		var route = require(moduleName)(config).map('localhost', '/');
		assert.equal(route.host, 'test-capybara');
		assert.equal(route.port, 22789);
	});

	it('Should set the default route from that specified in the config options', function() {
		config.argv = {
			routeoveride: '127.0.0.1:9000'
		};
		var route = require(moduleName)(config).map('localhost', '/');
		assert.equal(route.host, '127.0.0.1');
		assert.equal(route.port, 9000);
	});

	it('Should not match a named route against the url', function() {
		var route = require(moduleName)(config).map('localhost', '/capybara');
		assert.equal(route.host, '127.0.0.1');
		assert.equal(route.port, 5410);
	});
});
