'use strict';

var assert = require('proclaim');

var httpRequest = require('./lib/http-request');
var serversUnderTest = require('./lib/servers-under-test');

// To run just this test:
// ./node_modules/.bin/mocha --config=./tests/.mocharc.json ./tests/server/integration

describe('Smoke', function () {
	var getHomeResponseBody;
	var getCSSResponseBody;

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
		var serversReadyPromise = serversUnderTest.readyForTest();
		return serversReadyPromise
			.then(function () {
				var getHomePromise = getPath('/home');
				return getHomePromise
					.then(function (data) {
						getHomeResponseBody = data;
						var regexp = /\/public\/resources\/main-.+\.css/;
						var found = getHomeResponseBody.match(regexp)[0];
						var getCSSPromise = getPath(found);
						return getCSSPromise
							.then(function (data) {
								getCSSResponseBody = data;
								return serversUnderTest.finish();
							})
							.catch(function (err) {
								console.error(err);
								return serversUnderTest.finish();
							});
					})
					.catch(function (err) {
						console.error(err);
						return serversUnderTest.finish();
					});
			});
	}); // before

	after(function () {
		return serversUnderTest.finish();
	});

	// start actual tests
	it('Should return hello world text in response', function () {
		assert.isTrue(getHomeResponseBody.includes('<h1>Hello World!</h1>'));
	});
	it('Should return processed SASS in CSS file response', function () {
		assert.isTrue(getCSSResponseBody.includes('.should-be-orange{background-color:#ffa500}'));
	});
});
