const request = require('supertest');
const { Console } = require('winston/lib/winston/transports');
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
				console.error(err);
				serversUnderTest.finish();
			})
	});


const runTests = () => {
	return new Promise((resolve, reject) => {
		const testRequest = request('http://localhost:5400');
		testRequest
			.get('/home')
			.then(res => {
				console.log(res.text)
			})
			.catch(err => {
				reject(err)
			})
	});
}
