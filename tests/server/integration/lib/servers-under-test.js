'use strict';

var spawn = require('child_process').spawn;
var httpRequest = require('./http-request');

var processes = [];
var allProcessesUp = false;
// debugMode logs to console, and does not close servers after test run
//  so you can check http://127.0.0.1:5400/home manually
var debugMode = false;

// handles events common for both server processes, on stderr stdout etc.
var handleEventsForProcess = function (process, resolve, reject) {
	process.__isUp = false;

	// we cannot tell if a child process has finished spawing (no such event exists),
	//  so we have to wait for both of them to output something. And pray they aren't
	//  changed to start silently (unlikely, but if so, the tests will timeout).
	process.stdout.on('data', function (data) {
		if (allProcessesUp) {
			if (debugMode) {
				console.log(`${process.pid} stdout: ${data}`);
			}
			return;
		}

		process.__isUp = true;

		if (processes.length > 1 &&
			processes.every(function (process) {
				return process.__isUp === true;
			})) {
			allProcessesUp = true;
			resolve();
		}
	});

	process.stderr.on('data', function (data) {
		console.log(`${process.pid} stderr: ${data}`);
		reject();
	});
};

// starts the fe and be servers
// returns a Promise which resolves when both have output to their STDOUTs
var startServers = function () {
	return new Promise(function (resolve, reject) {
		var backend = spawn('node', ['../../bin/serve.js'], {
			cwd: 'tests/mock-app/'
		});
		processes.push(backend);
		handleEventsForProcess(backend, resolve, reject);

		// run the build script, as if in a production env
		var build = spawn('node', ['../../bin/compile.js'], {
			cwd: 'tests/mock-app/'
		});
		handleEventsForProcess(build, resolve, reject);

		// start the FE with one worker process (-c 1) in production mode, so it uses
		//  the assets previously built by the build script
		var thisEnv = process.env;
		thisEnv.NODE_ENV = 'production';
		var frontend = spawn('node', ['app', '-c', '1'], {
			cwd: 'tests/mock-app/',
			env: thisEnv
		});
		processes.push(frontend);
		handleEventsForProcess(frontend, resolve, reject);
	});
};
// ping the FE server
// returns a Promise which resolves once it recieves a pong response
//  or rejects on an unexpected error, or if maxTries exceeded
var serversResponding = function () {
	return new Promise(function (resolve, reject) {
		var tries = 0;
		var maxTries = 1000;
		var doPingLoop = function () {
			var thisRequestPromise = httpRequest({
				port: 5400,
				path: '/ping'
			});
			thisRequestPromise
				.then(function (res) {
					if (res.text.includes('pong')) {
						resolve(tries);
					}
				})
				.catch(function (err) {
					tries++;
					setTimeout(function () {
						if (err.message.includes('ECONNREFUSED') && tries < maxTries) {
							// server is still starting up
							doPingLoop();
						} else {
							reject(err);
						}
					}, 100); // do not pound the CPU, it's busy
				});
		};
		doPingLoop();
	});
};

var cleanup = function () {
	if (debugMode) {
		return;
	}

	try {
		processes.forEach(function (process) {
			process.kill('SIGINT');
		});
	} catch (err) {
		console.error(err);
	}
};

module.exports = {
	// starts up the servers, and pings the FE server
	//  returns a Promise that resolves once the FE pongs back
	readyForTest: function () {
		return new Promise(function (resolve, reject) {
			// sequential promises without async/await are not pretty
			var startServersPromise = startServers();
			startServersPromise
				.then(function () {
					var serversRespondingPromise = serversResponding();
					serversRespondingPromise
						.then(function () {
							resolve();
						})
						.catch(function (err) {
							console.error(err);
							reject(err);
							cleanup(); // tear down the test suite if we cant run smoke tests
						});
				})
				.catch(function (err) {
					console.error(err);
					reject(err);
					cleanup();
				});
		});
	},
	finish: function () {
		cleanup();
	}
};
