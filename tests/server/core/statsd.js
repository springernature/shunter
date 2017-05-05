
'use strict';

var assert = require('proclaim');
var sinon = require('sinon');
var mockery = require('mockery');

var modulePath = '../../../lib/statsd';
var mockConfig;

describe('Logging to statsd', function () {
	var client;

	beforeEach(function () {
		mockConfig = {
			statsd: {
				mappings: [
					{
						pattern: '^\\/foo\\/bar',
						name: 'foo_bar'
					},
					{
						pattern: '^\\/foo',
						name: 'foo'
					},
					{
						pattern: '^\\/test',
						name: 'test'
					}
				],
				mock: false
			},
			log: {
				error: sinon.stub()
			}
		};

		client = {
			increment: sinon.stub(),
			decrement: sinon.stub(),
			timing: sinon.stub(),
			gauge: sinon.stub(),
			gaugeDelta: sinon.stub(),
			histogram: sinon.stub(),
			set: sinon.stub()
		};

		mockery.enable({
			useCleanCache: true,
			warnOnUnregistered: false,
			warnOnReplace: false
		});

		mockery.registerMock('statsd-client', sinon.stub().returns(client));
	});
	afterEach(function () {
		mockery.deregisterAll();
		mockery.disable();
		mockConfig.log.error.reset();
	});

	describe('Native methods', function () {
		it('Should proxy `increment` calls to the statsd client', function () {
			var statsd = require(modulePath)(mockConfig);
			statsd.increment('foo');
			assert.isTrue(client.increment.calledOnce);
			assert.isTrue(client.increment.calledWith('foo'));
		});

		it('Should proxy `decrement` calls to the statsd client', function () {
			var statsd = require(modulePath)(mockConfig);
			statsd.decrement('foo');
			assert.isTrue(client.decrement.calledOnce);
			assert.isTrue(client.decrement.calledWith('foo'));
		});

		it('Should proxy `timing` calls to the statsd client', function () {
			var statsd = require(modulePath)(mockConfig);
			statsd.timing('foo', 1);
			assert.isTrue(client.timing.calledOnce);
			assert.isTrue(client.timing.calledWith('foo', 1));
		});

		it('Should proxy `gauge` calls to the statsd client', function () {
			var statsd = require(modulePath)(mockConfig);
			statsd.gauge('foo', 1, 0.25);
			assert.isTrue(client.gauge.calledOnce);
			assert.isTrue(client.gauge.calledWith('foo', 1, 0.25));
		});

		it('Should proxy `gaugeDelta` calls to the statsd client', function () {
			var statsd = require(modulePath)(mockConfig);
			statsd.gaugeDelta('foo', 1);
			assert.isTrue(client.gaugeDelta.calledOnce);
			assert.isTrue(client.gaugeDelta.calledWith('foo', 1));
		});

		it('Should proxy `histogram` calls to the statsd client', function () {
			var statsd = require(modulePath)(mockConfig);
			statsd.histogram('foo', 1);
			assert.isTrue(client.histogram.calledOnce);
			assert.isTrue(client.histogram.calledWith('foo', 1));
		});

		it('Should proxy `set` calls to the statsd client', function () {
			var statsd = require(modulePath)(mockConfig);
			statsd.set('foo', 1);
			assert.isTrue(client.set.calledOnce);
			assert.isTrue(client.set.calledWith('foo', 1));
		});
	});

	describe('Extended methods', function () {
		it('Should pass calls for `classifiedIncrement` to `increment`', function () {
			var statsd = require(modulePath)(mockConfig);
			statsd.classifiedIncrement('/test', 'foo');
			assert.isTrue(client.increment.calledOnce);
			assert.isTrue(client.increment.calledWith('foo_test'));
		});

		it('Should pass calls for `classifiedDecrement` to `decrement`', function () {
			var statsd = require(modulePath)(mockConfig);
			statsd.classifiedDecrement('/test', 'foo');
			assert.isTrue(client.decrement.calledOnce);
			assert.isTrue(client.decrement.calledWith('foo_test'));
		});

		it('Should pass calls for `classifiedTiming` to `timing`', function () {
			var statsd = require(modulePath)(mockConfig);
			statsd.classifiedTiming('/test', 'foo', 10);
			assert.isTrue(client.timing.calledOnce);
			assert.isTrue(client.timing.calledWith('foo_test', 10));
		});

		it('Should pass calls for `classifiedGauge` to `gauge`', function () {
			var statsd = require(modulePath)(mockConfig);
			statsd.classifiedGauge('/test', 'foo', 1);
			assert.isTrue(client.gauge.calledOnce);
			assert.isTrue(client.gauge.calledWith('foo_test', 1));
		});

		it('Should pass calls for `classifiedGaugeDelta` to `gaugeDelta`', function () {
			var statsd = require(modulePath)(mockConfig);
			statsd.classifiedGaugeDelta('/test', 'foo', 1);
			assert.isTrue(client.gaugeDelta.calledOnce);
			assert.isTrue(client.gaugeDelta.calledWith('foo_test', 1));
		});

		it('Should pass calls for `classifiedHistogram` to `histogram`', function () {
			var statsd = require(modulePath)(mockConfig);
			statsd.classifiedHistogram('/test', 'foo', 10);
			assert.isTrue(client.histogram.calledOnce);
			assert.isTrue(client.histogram.calledWith('foo_test', 10));
		});

		it('Should pass calls for `classifiedSet` to `set`', function () {
			var statsd = require(modulePath)(mockConfig);
			statsd.classifiedSet('/test', 'foo', 10);
			assert.isTrue(client.set.calledOnce);
			assert.isTrue(client.set.calledWith('foo_test', 10));
		});
	});

	describe('Classifying metrics', function () {
		it('Should classify the metric based on the first config mapping that matches the url', function () {
			var statsd = require(modulePath)(mockConfig);
			statsd.classifiedIncrement('/foo', 'a');
			assert.isTrue(client.increment.calledWith('a_foo'));
			statsd.classifiedIncrement('/foo/bar/baz', 'a');
			assert.isTrue(client.increment.calledWith('a_foo_bar'));
			statsd.classifiedIncrement('/foo/baz', 'a');
			assert.isTrue(client.increment.calledWith('a_foo'));
		});

		it('Should just use the metric name if the url does not match any of the mappings', function () {
			var statsd = require(modulePath)(mockConfig);
			statsd.classifiedIncrement('/bar', 'a');
			assert.isTrue(client.increment.calledWith('a'));
		});

		it('Should just use the metric name if no mappings are defined', function () {
			var statsd = require(modulePath)({statsd: {mock: false}});
			statsd.classifiedIncrement('/foo', 'a');
			assert.isTrue(client.increment.calledWith('a'));
		});
	});

	describe('Mocking statsd', function () {
		it('Should not proxy calls to the statsd client when mocked', function () {
			mockConfig.statsd.mock = true;

			var statsd = require(modulePath)(mockConfig);
			statsd.increment('foo');
			assert.isTrue(client.increment.notCalled);
		});
	});
});
