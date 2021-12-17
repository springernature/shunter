'use strict';

var assert = require('proclaim');
var sinon = require('sinon');
var mockery = require('mockery');
var path = require('path');

describe('Clustering', function () {
	var worker;
	var server;
	var cluster;
	var fs;
	var timers;
	var config;
	var pathJoinStub

	beforeEach(function () {
		config = {
			path: {
				root: '/',
				shunterRoot: path.join(path.dirname(__dirname), '../../')
			},
			log: require('../mocks/log'),
			middleware: [],
			argv: {
				'max-child-processes': 5
			}
		};

		worker = sinon.spy();

		mockery.enable({
			useCleanCache: true,
			warnOnUnregistered: false,
			warnOnReplace: false
		});
		mockery.registerMock('cluster', require('../mocks/cluster'));
		mockery.registerMock('fs', require('../mocks/fs'));
		mockery.registerMock('os', require('../mocks/os'));
		mockery.registerMock('./worker', worker);
		mockery.registerMock('./config', sinon.stub().returnsArg(1));

		timers = sinon.useFakeTimers(10);

		cluster = require('cluster');
		fs = require('fs');
		server = require('../../../lib/server')(config);
		sinon.stub(process, 'on');
		sinon.stub(process, 'exit');
		pathJoinStub =  sinon.stub(path, 'join');
	});
	afterEach(function () {
		mockery.deregisterAll();
		mockery.disable();
		process.on.restore();
		process.exit.restore();
		timers.restore();
		pathJoinStub.restore();
	});

	describe('Master', function () {
		it('Should create the right number of forks lower than max-child-processes', function () {
			require('os').cpus.returns([1, 1, 1]);
			server.start();
			assert.equal(cluster.fork.callCount, 3);
		});

		it('Should create the right number of forks no more than max-child-processes', function () {
			require('os').cpus.returns([1, 1, 1, 1, 1, 1]);
			server.start();
			assert.equal(cluster.fork.callCount, 5);
		});

		it('Should log a message when all child processes have been created', function () {
			require('os').cpus.returns([1, 1]);
			server.start();
			cluster.fork().on.yield();
			assert.isTrue(config.log.info.calledWith('Shunter started with 2 child processes listening'));
		});

		it('Should save the a pid file on start up', function () {
			require('os').cpus.returns([1, 1, 1]);
			pathJoinStub.returns('/shunter.pid');
			server.start();
			fs.writeFile.yield();
			assert.isTrue(fs.writeFile.calledWith('/shunter.pid', process.pid.toString()));
			assert.isTrue(config.log.debug.calledWith('Saved shunter.pid file for process ' + process.pid));
		});

		it('Should log an error if it was unable to write the pid file', function () {
			require('os').cpus.returns([1, 1, 1]);
			pathJoinStub.returns('/shunter.pid');
			server.start();
			fs.writeFile.yield({message: 'ERROR'});
			assert.isTrue(fs.writeFile.calledWith('/shunter.pid', process.pid.toString()));
			assert.isTrue(config.log.error.calledWith('Error saving shunter.pid file for process ' + process.pid + ' ERROR'));
		});

		it('Should save the current timestamp as json', function () {
			require('os').cpus.returns([1, 1, 1]);
			pathJoinStub.returns('/timestamp.json');
			server.start();
			assert.isTrue(fs.writeFileSync.calledWith('/timestamp.json', '{"value":10}'));
		});

		it('Should setup the SIGUSR2 handler', function () {
			require('os').cpus.returns([1, 1, 1]);
			server.start();
			assert.isTrue(process.on.calledWith('SIGUSR2'));
		});

		it('Should log a message when SIGUSR2 is captured', function () {
			require('os').cpus.returns([1, 1, 1]);
			server.start();
			process.on.withArgs('SIGUSR2').firstCall.yield();
			assert.isTrue(config.log.debug.calledWith('SIGUSR2 received, reloading all workers'));
		});

		it('Should save the timestamp when SIGUSR2 is captured', function () {
			require('os').cpus.returns([1, 1, 1]);
			pathJoinStub.returns('/timestamp.json');
			server.start();
			process.on.withArgs('SIGUSR2').firstCall.yield();
			assert.isTrue(fs.writeFileSync.calledWith('/timestamp.json', '{"value":10}'));
		});

		it('Should reload all worker processes when SIGUSR2 is captured', function () {
			var oldWorkers = [1234, 1235].map(function (pid) {
				return {
					process: {
						pid: pid
					},
					on: sinon.stub(),
					disconnect: sinon.stub()
				};
			});
			var newWorkers = [1236, 1237].map(function (pid) {
				return {
					process: {
						pid: pid
					},
					on: sinon.stub(),
					disconnect: sinon.stub()
				};
			});

			oldWorkers.forEach(function (worker, i) {
				cluster.workers[i] = worker;
				cluster.fork.onCall(i + 2).returns(newWorkers[i]);
			});

			require('os').cpus.returns([1, 1]);
			server.start();
			process.on.withArgs('SIGUSR2').firstCall.yield();

			assert.isTrue(oldWorkers[0].on.calledWith('disconnect'));
			assert.isTrue(oldWorkers[0].disconnect.calledOnce);
			assert.isTrue(newWorkers[0].on.calledWith('listening'));
			assert.isTrue(oldWorkers[1].on.notCalled);
			assert.isTrue(oldWorkers[1].disconnect.notCalled);
			assert.isTrue(newWorkers[1].on.notCalled);

			newWorkers[0].on.withArgs('listening').yield();

			assert.isTrue(oldWorkers[1].on.calledWith('disconnect'));
			assert.isTrue(oldWorkers[1].disconnect.calledOnce);
			assert.isTrue(newWorkers[1].on.calledWith('listening'));

			newWorkers[1].on.withArgs('listening').yield();

			assert.isTrue(config.log.info.calledWith('All replacement workers now running'));
		});

		it('Should log a message when the old workers are disconnected', function () {
			cluster.workers[0] = {
				process: {
					pid: '2345'
				},
				on: sinon.stub(),
				disconnect: sinon.stub()
			};

			require('os').cpus.returns([1]);
			server.start();
			process.on.withArgs('SIGUSR2').firstCall.yield();
			cluster.workers[0].on.withArgs('disconnect').yield();

			assert.isTrue(config.log.info.calledWith('Shutdown complete for 2345'));
		});

		it('Should force a worker to shutdown if it doesn\'t disconnect within 10 seconds', function () {
			cluster.workers[0] = {
				process: {
					pid: '2345'
				},
				on: sinon.stub(),
				disconnect: sinon.stub(),
				send: sinon.stub()
			};

			require('os').cpus.returns([1]);
			server.start();
			process.on.withArgs('SIGUSR2').firstCall.yield();

			timers.tick(10000);

			assert.isTrue(config.log.info.calledWith('Timed out waiting for 2345 to disconnect, killing process'));
			assert.isTrue(cluster.workers[0].send.calledWith('force exit'));
		});

		it('Should setup the SIGINT handler', function () {
			require('os').cpus.returns([1, 1, 1]);
			server.start();
			assert.isTrue(process.on.calledWith('SIGINT'));
		});

		it('Should exit the process cleanly when SIGINT is captured', function () {
			require('os').cpus.returns([1, 1, 1]);
			server.start();
			process.on.withArgs('SIGINT').firstCall.yield();
			assert.isTrue(process.exit.calledWith(0));
		});

		it('Should setup the exit handler', function () {
			require('os').cpus.returns([1, 1, 1]);
			server.start();
			assert.isTrue(process.on.calledWith('exit'));
		});

		it('Should delete the pid file when process.exit is fired', function () {
			require('os').cpus.returns([1, 1, 1]);
			require('path').join.returns('/shunter.pid');
			server.start();
			process.on.withArgs('exit').firstCall.yield();
			assert.isTrue(fs.unlinkSync.calledWith('/shunter.pid'));
		});

		it('Should listen for the exit event', function () {
			require('os').cpus.returns([1, 1, 1]);
			server.start();
			assert.isTrue(cluster.on.calledOnce);
			assert.isTrue(cluster.on.calledWith('exit'));
		});

		it('Should create a new fork on exit', function () {
			require('os').cpus.returns([1]);
			server.start();
			assert.equal(cluster.fork.callCount, 1);
			cluster.on.firstCall.args[1]({process: {pid: 1}}, 1, 1);
			assert.equal(cluster.fork.callCount, 2);
		});

		it('Should not create a new fork on exit if the worker was exited intentionally', function () {
			require('os').cpus.returns([1]);
			server.start();
			assert.equal(cluster.fork.callCount, 1);
			cluster.on.firstCall.args[1]({process: {pid: 1}}, 0, 1);
			assert.equal(cluster.fork.callCount, 1);
		});

		it('Should expose a getConfig() fn which returns the config', function () {
			server.start();
			assert.strictEqual(server.getConfig().path.root, '/');
		});
	});

	describe('Worker', function () {
		it('Should call worker with the config', function () {
			cluster.isMaster = false;
			server.start();
			assert.isTrue(worker.calledOnce);
			assert.equal(worker.args[0][0].path.root, '/');
		});
	});

	describe('Middleware', function () {
		it('Should expose a `use` method', function () {
			assert.isFunction(server.use);
		});

		it('Should add the arguments passed into `use` to the middleware config', function () {
			var fn1 = function () {};
			var fn2 = function () {};
			server.use('foo', fn1);
			server.use(fn2);
			assert.lengthEquals(config.middleware, 2);
			assert.isArray(config.middleware[0]);
			assert.strictEqual(config.middleware[0][0], 'foo');
			assert.strictEqual(config.middleware[0][1], fn1);
			assert.isArray(config.middleware[1]);
			assert.strictEqual(config.middleware[1][0], fn2);
		});
	});
});
