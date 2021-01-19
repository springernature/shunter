'use strict';

var assert = require('proclaim');

var httpRequest = require('./lib/httpRequest');
var serversUnderTest = require('./lib/serversUnderTest');

describe('Smoke', function () {
	var getHomeResponseBody;

	before(function (done) {
		// wait for the servers to spin up, then hit the home page
		var serversReadyPromise = serversUnderTest.readyForTest();
		serversReadyPromise
		.then(function () {
			var getHomePromise = getHome();
			getHomePromise
			.then(function (data) {
				getHomeResponseBody = data;
				serversUnderTest.finish();
				done(); // tell mocha it can now run the suite
			})
			.catch(function (err) {
				console.error(err);
				serversUnderTest.finish();
			})
		});

		// hit /home on the frontend server
		var getHome = function () {
			return new Promise(function(resolve, reject) {
				var testRequestPromise = httpRequest({
					port: 5400,
					path: '/home',
				});
				testRequestPromise
				.then(function (res) {
					resolve(res.text);
				})
				.catch(function (err) {
					reject(err)
				})
			});
		}
	}); // before

	// start actual tests
	it('Should return hello world text in response', function () {
		assert.isTrue(getHomeResponseBody.includes('<h1>Hello World!</h1>'));
	});
});
