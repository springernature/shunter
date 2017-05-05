'use strict';

var assert = require('proclaim');
var mockery = require('mockery');
var sinon = require('sinon');

describe('Output filtering', function () {
	var config;
	var filter;
	var eachModule;
	var filter1;
	var filter2;
	var filter3;
	var filter4;
	var filter5;

	beforeEach(function () {
		mockery.enable({
			useCleanCache: true,
			warnOnUnregistered: false,
			warnOnReplace: false
		});

		filter1 = sinon.spy(function (content) {
			return content + ':content';
		});
		filter2 = sinon.spy(function (content, contentType) {
			return content + ':contentType=' + contentType;
		});
		filter3 = sinon.spy(function (content, contentType, req) {
			return content + ':req.url=' + req.url;
		});
		filter4 = sinon.spy(function (content, contentType, req, config) {
			return content + ':config.foo=' + config.foo;
		});
		filter5 = sinon.spy(function () { });

		eachModule = require('../mocks/each-module');
		mockery.registerMock('each-module', eachModule);

		eachModule.withArgs('/app/node_modules/shunter/filters/output').callsArgWith(1, null, filter1);
		eachModule.withArgs('/app/node_modules/foo/filters/output').callsArgWith(1, null, filter2);
		eachModule.withArgs('/app/node_modules/bar/filters/output').callsArgWith(1, null, filter3);
		eachModule.withArgs('/app/node_modules/baz/filters/output').callsArgWith(1, null, filter4);
		eachModule.withArgs('/app/filters/output').callsArgWith(1, null, filter5);

		config = {
			modules: ['foo', 'bar', 'baz'],
			path: {
				root: '/app',
				shunterRoot: '/app/node_modules/shunter'
			},
			structure: {
				filters: 'filters',
				filtersOutput: 'output'
			},
			foo: 'foo'
		};
		filter = require('../../../lib/output-filter')(config);
	});

	afterEach(function () {
		mockery.deregisterAll();
		mockery.disable();
	});

	it('Should load filters from each of the expected locations', function () {
		assert.strictEqual(eachModule.callCount, 5);
	});

	it('Should load filters in the expected order', function () {
		sinon.assert.callOrder(
			eachModule.withArgs('/app/node_modules/shunter/filters/output'),
			eachModule.withArgs('/app/node_modules/foo/filters/output'),
			eachModule.withArgs('/app/node_modules/bar/filters/output'),
			eachModule.withArgs('/app/node_modules/baz/filters/output'),
			eachModule.withArgs('/app/filters/output')
		);
	});

	it('Should call each filter with the correct args', function () {
		var result = filter('text', 'text/html', {url: '/foo'});
		assert.strictEqual(result, 'text:content:contentType=text/html:req.url=/foo:config.foo=foo');
	});
});
