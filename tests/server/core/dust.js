/* eslint-disable camelcase */
'use strict';

var assert = require('proclaim');
var sinon = require('sinon');

describe('Template loading', function () {
	var dust = require('dustjs-helpers');
	var mockConfig = {
		argv: {},
		log: require('../mocks/log')
	};
	var mockRenderer = {
		TEMPLATE_CACHE_KEY_PREFIX: 'root',
		compileOnDemand: sinon.stub()
	};
	var options;
	var callback;

	var createMockCache = function (obj) {
		var cache = {};
		Object.keys(obj).forEach(function (key) {
			cache[mockRenderer.TEMPLATE_CACHE_KEY_PREFIX + '__' + key] = obj[key];
		});
		return cache;
	};

	require('../../../lib/dust')(dust, mockRenderer, mockConfig);

	beforeEach(function () {
		dust.cache = {};
		options = {};
		callback = sinon.stub();
	});
	afterEach(function () {
		mockConfig.log.warn.resetHistory();
		mockRenderer.compileOnDemand.resetHistory();
	});

	it('Should log and gracefully handle missing templates', function () {
		dust.onLoad('nonexistent', options, callback);
		assert(mockConfig.log.warn.calledOnce);
		assert.match(mockConfig.log.warn.lastCall.args[0], /nonexistent$/i);
		assert(callback.calledOnce);
		assert.strictEqual(callback.lastCall.args[0], null);
		assert.strictEqual(callback.lastCall.args[1], '');
	});

	it('Should attempt to compile unknown templates if `compile-on-demand` is enabled', function () {
		mockConfig.argv['compile-on-demand'] = true;
		dust.onLoad('notloaded', options, callback);
		assert(mockRenderer.compileOnDemand.calledOnce);
		assert(mockRenderer.compileOnDemand.calledWith('notloaded'));
	});

	it('Should load a given template from its keyname in the dust cache', function () {
		var templateStub = sinon.stub();
		dust.cache = createMockCache({
			foo: templateStub
		});
		dust.onLoad('foo', options, callback);
		assert(callback.calledOnce);
		assert.strictEqual(callback.lastCall.args[0], null);
		assert.strictEqual(callback.lastCall.args[1], templateStub);
	});

	it('Should use a nested template instead of the default one', function () {
		var templateStub = sinon.stub();
		var parentStub = sinon.stub();
		var rootStub = sinon.stub();

		options = {
			namespace: 'bar__bash'
		};
		dust.cache = createMockCache({
			bar__bash__foo: templateStub,
			bar__foo: parentStub,
			foo: rootStub
		});
		dust.onLoad('foo', options, callback);

		assert.equal(callback.lastCall.args[0], null);
		assert.equal(callback.lastCall.args[1], templateStub);
	});

	it('Should use the parent-level (app-level) template if a nested (project-level) one cannot be found', function () {
		var parentStub = sinon.stub();
		var rootStub = sinon.stub();

		options = {
			namespace: 'bar__bash'
		};
		dust.cache = createMockCache({
			bar__foo: parentStub,
			foo: rootStub
		});
		dust.onLoad('foo', options, callback);

		assert.equal(callback.lastCall.args[0], null);
		assert.equal(callback.lastCall.args[1], parentStub);
	});

	it('Should use the default root-level template if no namespaced template can be found', function () {
		var rootStub = sinon.stub();

		options = {
			namespace: 'bar__bash'
		};
		dust.cache = createMockCache({
			foo: rootStub
		});
		dust.onLoad('foo', options, callback);

		assert.equal(callback.lastCall.args[0], null);
		assert.equal(callback.lastCall.args[1], rootStub);
	});

	it('Should check the full template name in the local namespace', function () {
		var localStub = sinon.stub();
		var parentStub = sinon.stub();
		var rootStub = sinon.stub();

		options = {
			namespace: 'foo__bar'
		};
		dust.cache = createMockCache({
			foo__bar__baz__quux: localStub,
			foo__baz__quux: parentStub,
			baz__quux: rootStub
		});
		dust.onLoad('baz__quux', options, callback);

		assert.equal(callback.lastCall.args[0], null);
		assert.equal(callback.lastCall.args[1], localStub);
	});

	it('Should check the full template name in the parent namespace', function () {
		var parentStub = sinon.stub();
		var rootStub = sinon.stub();

		options = {
			namespace: 'foo__bar'
		};
		dust.cache = createMockCache({
			foo__baz__quux: parentStub,
			baz__quux: rootStub
		});
		dust.onLoad('baz__quux', options, callback);

		assert.equal(callback.lastCall.args[0], null);
		assert.equal(callback.lastCall.args[1], parentStub);
	});

	it('Should check the full template name in the root namespace', function () {
		var rootStub = sinon.stub();

		options = {
			namespace: 'foo__bar'
		};
		dust.cache = createMockCache({
			baz__quux: rootStub
		});
		dust.onLoad('baz__quux', options, callback);

		assert.equal(callback.lastCall.args[0], null);
		assert.equal(callback.lastCall.args[1], rootStub);
	});

	it('Should check the namespace contains the full path for the template', function () {
		var localStub = sinon.stub();
		var parentStub = sinon.stub();
		var rootStub = sinon.stub();

		options = {
			namespace: 'foo__bar'
		};
		dust.cache = createMockCache({
			foo__bar__quux: localStub,
			foo__baz__quux: parentStub,
			baz__quux: rootStub
		});
		dust.onLoad('baz__quux', options, callback);

		assert.equal(callback.lastCall.args[0], null);
		assert.equal(callback.lastCall.args[1], parentStub);
	});
});
