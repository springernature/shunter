const request = require('supertest');
const assert = require('proclaim');

const serversUnderTest = require('./lib/serversUnderTest');

describe('Smoke', () => {
	let getHomeResponseBody;

	before(done => {
		// wait for the servers, run the tests, then cleanup
		const serversReadyPromise = serversUnderTest.readyForTest();
		serversReadyPromise
		.then(() => {
			const getHomePromise = getHome();
			getHomePromise
			.then(data => {
				getHomeResponseBody = data;
				serversUnderTest.finish();
				done(); // let mocha know it can now run the suite
			})
			.catch(err => {
				console.error(err);
				serversUnderTest.finish();
			})
		});

		const getHome = () => {
			return new Promise((resolve, reject) => {
				const testRequest = request('http://localhost:5400');
				testRequest
				.get('/home')
				.then(res => {
					console.log(res.text)
					resolve(res.text);
				})
				.catch(err => {
					reject(err)
				})
			});
		}
	}); // before

	it('Should return hello world text in response', () => {
		console.log(getHomeResponseBody)
		assert.isTrue(getHomeResponseBody === 'ff');
	});
});
