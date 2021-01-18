'use strict';

const spawn = require('child_process').spawn;
const request = require('supertest');

let processes = new Array();
let allProcessesUp = false;

// starts the fe and be servers
// returns a Promise which resolves when both have output to their STDOUTs
const startServers = () => {
	return new Promise((resolve, reject) => {
		let backend = spawn('node', ['../../bin/serve.js'], {
			cwd: 'tests/mock-app/'
		});
		processes.push(backend);
		handleEventsForProcess(backend, resolve, reject);

		// start the FE with one worker process (-c 1), and compile the templates on demand
		//  to minimise the time between server up and server able to handle reqs
		let frontend = spawn('node', ['app', '-c', '1', '--compile-on-demand', 'true'], {
			cwd: 'tests/mock-app/'
		});
		processes.push(frontend);
		handleEventsForProcess(frontend, resolve, reject);
	});
};

// handles events common for both server processes, on stderr stdout etc.
const handleEventsForProcess = (process, resolve, reject) => {
	// console.log(`Spawned child pid: ${process.pid}`);
	process.isUp = false;

	// we cannot tell if a child process has finished spawing (no such event exists),
	//  so we have to wait for both of them to output something. And pray they aren't
	//  changed to start silently (unlikely, but if so, the tests will hang).
	process.stdout.on('data', (data) => {
		console.log(`${process.pid} stdout: ${data}`);
		if (allProcessesUp) {
			return;
		}

		process.isUp = true;

		/*
		let pc = 0;
		processes.forEach(process => {
			console.log(`PROCESSS ${pc} isup ${process.isUp}`);
			pc++
		})
		*/

		if (processes.length > 1 && processes.every(process => process.isUp === true)){
			allProcessesUp = true;
			resolve();
		}
	});

	process.stderr.on('data', data => {
		console.log(`${process.pid} stderr: ${data}`);
		reject();
	});

	process.on('close', data => {
		console.log(`${process.pid} child process exited with code: ${data}`);
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
		processes.forEach(process => process.kill('SIGINT'));
	} catch (err) {
		console.error(err);
	}
};

module.exports = {
	// starts up the servers, and pings the FE server
	//  returns a Promise that resolves once the FE pongs back, or crashes and burns
	readyForTest: () => {
		return new Promise((resolve, reject) => {
			// sequential promises without async/await are not pretty
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
					cleanup();
				});
		})
	},
	finish: () => {
		cleanup();
	}
};
