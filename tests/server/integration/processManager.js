'use strict';

var spawn = require('child_process').spawn;

var handleEventsForProcess = function (process, label, resolve, reject, allProcessesUp, processesUp) {

	function confirmProcessUp (label) {
		processesUp[label] = true;
		console.log(label + ' is now '+ processesUp[label])
		console.log('processesUp.frontendChild is now '+ processesUp.frontendChild)
		console.log('processesUp.backendChild is now '+ processesUp.backendChild)

		if (processesUp.frontendChild && processesUp.backendChild) {
			allProcessesUp = true;
			console.log('resolve '+ label)
			resolve();
		}
	};

	// we cannot tell if a child process has finished spawing (no such event exists),
	//  so we have to wait for both of them to output something. And pray they aren't
	//  changed to start silently.
	process.stdout.on('data', function (data) {
		if (!allProcessesUp) {
			confirmProcessUp(label)
		};

		console.log(label + ' stdout: ' + data);
	});

	process.stderr.on('data', function (data) {
		console.log(label + ' stderr: ' + data);
	});

	process.on('close', function (data) {
		console.log(label + ' child process exited with code: ' + data);
		reject();
	});
}

// SIGINT to gracefulyl clsoe
module.exports = {
	startServers: function() {
		return new Promise(function (resolve, reject) {
			var allProcessesUp = false;
			var processesUp = {
				frontendChild: false,
				backendChild: false
			}

			var backendChild = spawn('node', ['./bin/serve.js']);
			handleEventsForProcess(backendChild, 'backendChild', resolve, reject, allProcessesUp, processesUp);

			var frontendChild = spawn('node', ['app', '-c', '1'], {
				cwd: 'tests/mock-app/'
			});
			handleEventsForProcess(frontendChild, 'frontendChild', resolve, reject, allProcessesUp, processesUp);
		});
	}
}
