'use strict';

const spawn = require('child_process').spawn;

const handleEventsForProcess = function (process, label, resolve, reject, processesUp) {

	function confirmProcessUp (label) {
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
	});

	process.on('close', function (data) {
		console.log(`${label} child process exited with code: ${data}`);
		reject();
	});
}

// SIGINT to gracefully close
module.exports = {
	startServers: function() {
		return new Promise(function (resolve, reject) {
			// we need to resolve() when all processes are up, so share these refs between children
			let processesUp = {
				frontendChild: false,
				backendChild: false
			}

			const backendChild = spawn('node', ['../../bin/serve.js'], {
				cwd: 'tests/mock-app/'
			});
			handleEventsForProcess(backendChild, 'backendChild', resolve, reject, processesUp);

			// start the FE with one worker process, and compile the templates on demand
			//  to offset the short time between server startups and the first test HTTP req
			const frontendChild = spawn('node', ['app', '-c', '1', '--compile-on-demand', 'true'], {
				cwd: 'tests/mock-app/'
			});
			handleEventsForProcess(frontendChild, 'frontendChild', resolve, reject, processesUp);
		});
	}
}
