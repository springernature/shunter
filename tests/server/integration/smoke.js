const request = require('supertest');
const serversUnderTest = require('./lib/serversUnderTest');

// wait for the servers, run the tests, then cleanup
const serversReadyPromise = serversUnderTest.readyForTest();
serversReadyPromise
	.then(() => {
		const runTestsPromise = runTests();
		runTestsPromise
			.then(() => {
				serversUnderTest.finish();
			})
			.catch(err => {
				serversUnderTest.finish();
			});
	})


const runTests = function() {
	return new Promise((resolve, reject) => {
		const testRequest = request('http://localhost:5400');
		testRequest
			.get('/home')
			.then(res => {
				console.log(res.text)
			})
			.catch(err => {
				reject(err)
			});
	});
}

