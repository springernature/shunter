'use strict';

var mockery = require('mockery');
var sinon = require('sinon');
var assert = require('proclaim');

var moduleName = '../../../lib/benchmark';

describe('Benchmarking requests', function () {
	var statsd;

	before(function () {
		mockery.enable({
			useCleanCache: true,
			warnOnUnregistered: false,
			warnOnReplace: false
		});

		statsd = require('../mocks/statsd');

		mockery.registerMock('./statsd', statsd);
	});
	after(function () {
		mockery.deregisterAll();
		mockery.disable();
	});

	it('Should record the time taken for the request when res.end is called', function () {
		var req = {
			url: '/test'
		};
		var end = sinon.stub();
		var res = {
			end: end
		};
		var next = sinon.stub();

		var benchmark = require(moduleName)({
			timer: sinon.stub().returns(sinon.stub().returns(1337))
		});
		benchmark(req, res, next);

		assert.isTrue(next.calledOnce);
		assert.isTrue(end.notCalled);
		assert.isTrue(statsd().timing.notCalled);

		res.end('Content');

		assert.isTrue(statsd().classifiedTiming.calledOnce);
		assert.isTrue(statsd().classifiedTiming.calledWith('/test', 'response_time', 1337));
		assert.isTrue(end.calledOnce);
		assert.isTrue(end.calledWith('Content'));
	});
});
