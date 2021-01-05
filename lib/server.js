'use strict';

module.exports = function (config) {
	const cluster = require('cluster');
	const fs = require('fs');
	const path = require('path');
	var config = require('./config')(process.env.NODE_ENV, config);

	const SHUTDOWN_TIMEOUT = 10000;

	const init = function (count, callback) {
		cluster.on('exit', function (worker, code) {
			if (code !== 0) {
				config.log.error(worker.process.pid + ' died with error code ' + code + ', starting new worker...');
				cluster.fork();
			}
		});

		let ready = 0;
		const listening = function () {
			if (++ready === count) {
				callback();
			}
		};

		for (let i = 0; i < count; ++i) {
			cluster.fork().on('listening', listening);
		}
	};

	const restart = function () {
		const replace = function (workers) {
			if (workers.length === 0) {
				config.log.info('All replacement workers now running');
				return;
			}

			const parasite = cluster.workers[workers[0]];
			const worker = cluster.fork();
			const pid = parasite.process.pid;
			let timeout;

			parasite.on('disconnect', function () {
				config.log.info('Shutdown complete for ' + pid);
				clearTimeout(timeout);
			});
			parasite.disconnect();
			timeout = setTimeout(function () {
				config.log.info('Timed out waiting for ' + pid + ' to disconnect, killing process');
				parasite.send('force exit');
			}, SHUTDOWN_TIMEOUT);

			worker.on('listening', function () {
				config.log.info('Created process ' + worker.process.pid + ' to replace ' + pid);
				replace(workers.slice(1));
			});
		};

		replace(Object.keys(cluster.workers));
	};

	const saveProcessId = function () {
		const pid = process.pid;
		fs.writeFile(path.join(config.path.root, 'shunter.pid'), pid, function (err) {
			if (err) {
				config.log.error('Error saving shunter.pid file for process ' + pid + ' ' + (err.message || err.toString()));
			} else {
				config.log.debug('Saved shunter.pid file for process ' + pid);
			}
		});
	};

	const clearProcessId = function () {
		config.log.debug('Deleting old shunter.pid file');
		fs.unlinkSync(path.join(config.path.root, 'shunter.pid'));
	};

	const saveTimestamp = function () {
		fs.writeFileSync(path.join(config.path.shunterRoot, 'timestamp.json'), '{"value":' + Date.now() + '}');
	};

	return {
		use: function () {
			config.middleware.push(Array.prototype.slice.call(arguments));
		},
		start: function () {
			if (cluster.isMaster) {
				const childProcesses = Math.min(
					require('os').cpus().length,
					config.argv['max-child-processes']
				);
				saveTimestamp();
				saveProcessId();

				init(childProcesses, function () {
					config.log.info('Shunter started with ' + childProcesses + ' child processes listening');
				});

				process.on('SIGUSR2', function () {
					config.log.debug('SIGUSR2 received, reloading all workers');
					saveTimestamp();
					restart();
				});
				process.on('SIGINT', function () {
					config.log.debug('SIGINT received, exiting...');
					process.exit(0);
				});
				process.on('exit', function () {
					clearProcessId();
					config.log.info('Goodbye!');
				});
			} else {
				require('./worker')(config);
			}

			return this;
		},
		getConfig: function () {
			return config;
		}
	};
};
