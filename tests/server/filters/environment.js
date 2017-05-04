'use strict';

var assert = require('proclaim');
var sinon = require('sinon');

var filter = require('../../../filters/input/environment.js');

describe('Populate data with environment info', function () {
	var callback;

	beforeEach(function () {
		callback = sinon.stub();
	});

	it('Should add the request url', function () {
		filter({}, {
			url: '/hello'
		}, {}, {}, callback);
		assert.strictEqual(callback.firstCall.args[0].request_url, '/hello');
	});

	it('Should handle query parameters', function () {
		var params = {
			test: 'Something'
		};

		filter({}, {
			url: '/hello/world?test=something',
			query: params
		}, {}, {}, callback);
		assert.strictEqual(callback.firstCall.args[0].request_url, '/hello/world');
		assert.strictEqual(callback.firstCall.args[0].query_data.test, 'Something');
	});

	it('Should convert a query parameter containing true or false to a truthy value', function () {
		/* eslint-disable camelcase */
		var params = {
			show_ads: 'false',
			disable_third_party_scripts: 'true'
		};
		/* eslint-enable camelcase */

		filter({}, {
			url: '/hello/world?show_ads=false&disable_third_party_scripts=true',
			query: params
		}, {}, {}, callback);
		assert.strictEqual(callback.firstCall.args[0].request_url, '/hello/world');
		assert.strictEqual(callback.firstCall.args[0].query_data.show_ads, false);
		assert.strictEqual(callback.firstCall.args[0].query_data.disable_third_party_scripts, true);
	});

	it('Should convert a query parameter containing an integer to a numeric value', function () {
		var params = {
			page: '2'
		};

		filter({}, {
			url: '/hello/world?page=2',
			query: params
		}, {}, {}, callback);
		assert.strictEqual(callback.firstCall.args[0].request_url, '/hello/world');
		assert.strictEqual(callback.firstCall.args[0].query_data.page, 2);
	});

	it('Should support passing through arrays from the query data', function () {
		var params = {
			journals: ['hortres', 'mtm', 'true', '7']
		};

		filter({}, {
			url: '/page?journals[]=hortres&journals[]=mtm',
			query: params
		}, {}, {}, callback);
		assert.isArray(callback.firstCall.args[0].query_data.journals);
		assert.strictEqual(callback.firstCall.args[0].query_data.journals.length, 4);
		assert.strictEqual(callback.firstCall.args[0].query_data.journals[0], 'hortres');
		assert.strictEqual(callback.firstCall.args[0].query_data.journals[1], 'mtm');
		assert.strictEqual(callback.firstCall.args[0].query_data.journals[2], true);
		assert.strictEqual(callback.firstCall.args[0].query_data.journals[3], 7);
	});
});
