'use strict';

var assert = require('proclaim');

var httpRequest = require('./lib/http-request');
var serversUnderTest = require('./lib/servers-under-test');

// To run just this test:
// ./node_modules/.bin/mocha --config=./tests/.mocharc.json ./tests/server/integration

describe('error requests should not affect subsequent requests', function () {
	var getHomeResponseBodyBefore;
	var getHomeResponseBodyAfter;

	before(function () {
		// GET on the frontend server
		var getPath = function (path) {
			return new Promise(function (resolve, reject) {
				var testRequestPromise = httpRequest({
					port: 5400,
					path: path
				});
				testRequestPromise
					.then(function (res) {
						resolve(res.text);
					})
					.catch(function (err) {
						reject(err);
					});
			});
		};

		// wait for the servers to spin up, then hit the home page
		var serversReadyPromise = serversUnderTest.readyForTest()

		return serversReadyPromise
			.then(function () {
				// do some request to see whether it catches the body properly
				var getHomepromiseBefore = getPath('/');
				return getHomepromiseBefore
					.then(function (data) {
						getHomeResponseBodyBefore = data;
						// do some request with a response code >=400 to trigger the bug
						return getPath('/unknown').catch(function () {
							// do the first request again to show it's not returning the body properly this time
							var getHomepromiseAfter = getPath('/');
							return getHomepromiseAfter
								.then(function (data) {
									getHomeResponseBodyAfter = data;
									serversUnderTest.finish();
								});
						});
					});
			})
	});

	after(function () {
		serversUnderTest.finish();
	});

	// start actual tests
	it('Should return the Shunter homepage both before and after the error', function () {
		assert.isTrue(getHomeResponseBodyBefore.includes('Hello Shunter!'));
		assert.isTrue(getHomeResponseBodyAfter.includes('Hello Shunter!'));
	});
});
