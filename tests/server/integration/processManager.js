'use strict';

const exit = require('process').exit;
const spawn = require('child_process').spawn;
const request = require('supertest');

let backendChild;
let frontendChild;

// starts the fe and be servers
// returns a Promise which resolves when both have output to their STDOUTs
const startServers = () => {
	return new Promise(function (resolve, reject) {
		// we need to resolve() when all processes are up, so share these refs between children
		let processesUp = {
			frontendChild: false,
			backendChild: false
		}

		backendChild = spawn('node', ['../../bin/serve.js'], {
			cwd: 'tests/mock-app/'
		});
		handleEventsForProcess(backendChild, 'backendChild', resolve, reject, processesUp);

		// start the FE with one worker process, and compile the templates on demand
		//  to offset the short time between server startups and the first test HTTP req
		frontendChild = spawn('node', ['app', '-c', '1', '--compile-on-demand', 'true'], {
			cwd: 'tests/mock-app/'
		});
		handleEventsForProcess(frontendChild, 'frontendChild', resolve, reject, processesUp);

	});
};

// handles events common for both server processes, on stderr stdout etc.
const handleEventsForProcess = function (process, label, resolve, reject, processesUp) {
	const confirmProcessUp = (label) => {
		processesUp[label] = true;
		if (processesUp.frontendChild && processesUp.backendChild) {
			resolve();
		}
	};

	// we cannot tell if a child process has finished spawing (no such event exists),
	//  so we have to wait for both of them to output something. And pray they aren't
	//  changed to start silently (unlikely, but if so, the tests will hang).
	process.stdout.on('data', function (data) {
		if (!(processesUp.frontendChild && processesUp.backendChild)) {
			confirmProcessUp(label)
		};
		console.log(`${label} stdout: ${data}`);
	});

	process.stderr.on('data', function (data) {
		console.log(`${label} stderr: ${data}`);
		reject();
	});

	process.on('close', function (data) {
		console.log(`${label} child process exited with code: ${data}`);
	});
}

// ping the FE server
// returns a Promise which resolves once it recieves a pong response
//  or rejects on an unexpected error, or if maxTries exceeded
const serversResponding = () => {
	return new Promise((resolve, reject) => {
		let tries = 0;
		const maxTries = 1000;
		const thisRequest = request('http://localhost:5400');
		const doPingLoop = () => {
			thisRequest
			.get('/ping')
			.then(res => {
				if (res.text === 'pong') {
					resolve(tries);
				}
			})
			.catch(err => {
				tries++;
				if (err.message === 'ECONNREFUSED: Connection refused' && tries < maxTries) {
					doPingLoop();
				} else {
					reject(err);
				}
			});
		}
		doPingLoop();
	});
};

const cleanup = () => {
	try {
		backendChild.kill('SIGINT');
		frontendChild.kill('SIGINT');
	} catch (err) {
		console.error(err);
	}
};

module.exports = {
	// starts up the servers, and pings the FE server
	//  returns a Promise that resolves once the FE pongs back, or crashes and burns
	readyForTest: () => {
		return new Promise((resolve, reject) => {
			let startServersPromise = startServers();
			startServersPromise
				.then(() => {
					let serversRespondingPromise = serversResponding();
					serversRespondingPromise
						.then(() => {
							resolve()
						})
						.catch(err => {
							console.error(err)
							reject(err);
							cleanup(); // tear down the test suite if we cant run smoke tests
						});
				})
				.catch(err => {
					console.error(err)
					reject(err);
					cleanup(); // tear down the test suite if we cant run smoke tests
				});
		})
	},
	finish: () => {
		cleanup();
	}
};
