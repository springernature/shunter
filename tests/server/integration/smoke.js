var request = require('supertest');
var processManager = require('./processManager');

var readyForTestPromise = processManager.readyForTest();
readyForTestPromise
	.then(() => {
		var runTestsPromise = runTests();
		runTestsPromise
			.then(() => {
				processManager.finish();
			})
			.catch(err => {
				processManager.finish();
			});
	})


var runTests = function() {
	return new Promise((resolve, reject) => {
		request = request('http://localhost:5400');
		request
		.get('/home')
		.then(res => {
			console.log(res.text)
		})
		.catch(err => {
			reject(err)
		});
	});
}

