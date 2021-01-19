'use strict';

var request = require('supertest');
var assert = require('proclaim');

var serversUnderTest = require('./lib/serversUnderTest');

describe('Smoke', function () {
	var getHomeResponseBody;

	before(function (done) {
		// wait for the servers, run the tests, then cleanup
		var serversReadyPromise = serversUnderTest.readyForTest();
		serversReadyPromise
		.then(function () {
			var getHomePromise = getHome();
			getHomePromise
			.then(function (data) {
				getHomeResponseBody = data;
				serversUnderTest.finish();
				done(); // var mocha know it can now run the suite
			})
			.catch(function (err) {
				console.error(err);
				serversUnderTest.finish();
			})
		});

		var getHome = function () {
			return new Promise(function(resolve, reject) {
				var testRequest = request('http://localhost:5400');
				testRequest
				.get('/home')
				.then(function (res) {
					resolve(res.text);
				})
				.catch(function (err) {
					reject(err)
				})
			});
		}
	}); // before

	it('Should return hello world text in response', function () {
		assert.isTrue(getHomeResponseBody.includes('<h1>Hello World!</h1>'));
	});
});
