'use strict';

var assert = require('proclaim');
var sinon = require('sinon');

describe('Input filtering', function () {
	var filter;
	var config;

	beforeEach(function () {
		config = {
			test: 'fake config',
			log: require('../mocks/log')
		};
		filter = require('../../../lib/input-filter')(config);
	});

	describe('Filter helpers', function () {
		it('Should find a whether a key exists in the article context', function () {
			var data = {
				article: {
					test: 'pass'
				},
				test: 'fail'
			};
			assert.strictEqual(filter.getBase(data, 'test').test, 'pass');
		});

		it('Should find whether a key exists in the global context', function () {
			var data = {
				article: {
					test2: 'fail'
				},
				test: 'pass'
			};
			assert.strictEqual(filter.getBase(data, 'test').test, 'pass');
		});

		it('Should return null if the key is not found', function () {
			var data = {
				article: {
					test2: 'fail'
				},
				test: 'pass'
			};
			assert.isNull(filter.getBase(data, 'test3'));
		});
	});

	describe('Creating filters', function () {
		it('Should create an empty list of filters', function () {
			assert.isArray(filter.filters);
			assert.strictEqual(filter.filters.length, 0);
		});

		it('Should allow filters to be added', function () {
			filter.add(sinon.stub());
			assert.strictEqual(filter.filters.length, 1);
		});
	});

	describe('Running filters', function () {
		it('Should apply all filters in the list in order', function () {
			var callback = sinon.stub();

			var spy1 = sinon.spy(function (data) {
				return 'filter 1';
			});
			var spy2 = sinon.spy(function (data) {
				return 'filter 2';
			});

			filter.add(spy1);
			filter.add(spy2);

			filter.run({}, {}, 'init', callback);

			assert.isTrue(spy1.calledOnce);
			assert.isTrue(spy1.calledWith('init'));
			assert.isTrue(spy2.calledOnce);
			assert.isTrue(spy2.calledWith('filter 1'));
			assert.isTrue(callback.calledOnce);
			assert.isTrue(callback.calledWith('filter 2'));
		});

		it('Should pass a callback if the filter specifies a second argument', function () {
			var callback = sinon.stub();

			var spy = sinon.spy(function (data, fn) {
				fn('filter 1');
			});

			filter.add(spy);

			filter.run({}, {}, 'init', callback);

			assert.isTrue(spy.calledOnce);
			assert.isTrue(spy.calledWith('init'));
			assert.isFunction(spy.args[0][1]);
			assert.isTrue(callback.calledOnce);
			assert.isTrue(callback.calledWith('filter 1'));
		});

		it('Should additionally provide config if the filter specifies three arguments', function () {
			var callback = sinon.stub();

			var spy = sinon.spy(function (config, data, fn) {
				fn('filter 1');
			});

			filter.add(spy);

			filter.run({}, {}, 'init', callback);

			assert.isTrue(spy.calledOnce);
			assert.isTrue(spy.calledWith(config, 'init'));
			assert.isFunction(spy.args[0][2]);
			assert.isTrue(callback.calledOnce);
			assert.isTrue(callback.calledWith('filter 1'));
		});

		it('Should additionally provide the request and response if the filter specifies five arguments', function () {
			var callback = sinon.stub();

			var spy = sinon.spy(function (config, req, res, data, fn) {
				fn('filter 1');
			});

			filter.add(spy);

			filter.run('request', 'response', 'init', callback);

			assert.isTrue(spy.calledOnce);
			assert.isTrue(spy.calledWith(config, 'request', 'response', 'init'));
			assert.isFunction(spy.args[0][4]);
			assert.isTrue(callback.calledOnce);
			assert.isTrue(callback.calledWith('filter 1'));
		});

		it('Should skip a filter that defines an unsupported number of arguments', function () {
			var callback = sinon.stub();

			var spy1 = sinon.spy(function () {
				return 'filter 1';
			});
			var spy2 = sinon.spy(function (arg1, arg2, arg3, arg4) {
				return 'filter 2';
			});
			var spy3 = sinon.spy(function (arg1, arg2, arg3, arg4, arg5, arg6) {
				return 'filter 3';
			});

			filter.add(spy1);
			filter.add(spy2);
			filter.add(spy3);

			filter.run({}, {}, 'init', callback);

			assert.strictEqual(spy1.callCount, 0);
			assert.strictEqual(spy2.callCount, 0);
			assert.strictEqual(spy3.callCount, 0);
			assert.isTrue(callback.calledOnce);
			assert.isTrue(callback.calledWith('init'));
		});

		it('Should run each filter with the input-filter as the caller object', function () {
			var callback = sinon.stub();

			var spy1 = sinon.spy(function (data) {
				return 'filter 1';
			});
			var spy2 = sinon.spy(function (data, fn) {
				fn('filter 2');
			});
			var spy3 = sinon.spy(function (config, data, fn) {
				fn('filter 3');
			});
			var spy4 = sinon.spy(function (config, req, res, data, fn) {
				fn('filter 4');
			});

			filter.add(spy1);
			filter.add(spy2);
			filter.add(spy3);
			filter.add(spy4);

			filter.run({}, {}, 'init', callback);

			assert.isTrue(spy1.calledOnce);
			assert.isTrue(spy1.calledOn(filter));
			assert.isTrue(spy2.calledOnce);
			assert.isTrue(spy2.calledOn(filter));
			assert.isTrue(spy3.calledOnce);
			assert.isTrue(spy3.calledOn(filter));
			assert.isTrue(spy4.calledOnce);
			assert.isTrue(spy4.calledOn(filter));
		});
	});
});
