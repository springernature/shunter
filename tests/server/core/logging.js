'use strict';

var assert = require('proclaim');
var mockery = require('mockery');
var winston = require('winston');

describe('Shunter logging configuration', function() {

	var defaultShunterConfig = {
		argv: {
			syslog: true
		},
		env: {
			host: function() {
				return 'some.host.name'
			}
		},
		log: require('../mocks/log'),
		path: {
			root: './',
			shunterRoot: '/app'
		},
		structure: {
			logging: 'logging',
			loggingFilters: 'filters',
			loggingTransports: 'transports'
		},
		syslogAppName: 'foo'
	};

//	var appjsConfig = {};
//	var defaultShunterConfig = require('../../../lib/config')(process.env.NODE_ENV, appjsConfig);

	describe('No logging config provided', function() {

		/*
		var env;

		beforeEach(function() {
			env = process.env.NODE_ENV;
			process.env.NODE_ENV = 'ci';

			mockery.enable({
				useCleanCache: true,
				warnOnUnregistered: false,
				warnOnReplace: false
			});
			mockery.registerMock('os', require('../mocks/os'));
		});
		afterEach(function() {
			process.env.NODE_ENV = env;

			mockery.deregisterAll();
			mockery.disable();
		});
		*/

		it('Should offer getConfig() in its API', function() {
			var loggingInstance = require('../../../lib/logging')(defaultShunterConfig);
			assert.isFunction(loggingInstance.getConfig);
		});

		it('Should load the winston console transport', function() {
			var logger = require('../../../lib/logging')(defaultShunterConfig).getConfig();
			assert.isObject(logger.transports.console);
		});

		it('Should load the winston syslog transport', function() {
			var logger = require('../../../lib/logging')(defaultShunterConfig).getConfig();
			assert.isObject(logger.transports.syslog);
		});
	});


	describe('syslog not required', function() {

		it('Should not load syslog if either argv.syslog is falsy', function() {
			var thisConfig = defaultShunterConfig;
			delete thisConfig.argv.syslog;
			var logger = require('../../../lib/logging')(thisConfig).getConfig();
			assert.isNotObject(logger.transports.syslog);
		});

		it('Should not load syslog if syslogAppName is falsy', function() {
			var thisConfig = defaultShunterConfig;
			delete thisConfig.syslogAppName;
			var logger = require('../../../lib/logging')(thisConfig).getConfig();
			assert.isNotObject(logger.transports.syslog);
		});
	});


	describe('Userland logging config provided', function() {

		var userTransport = function(defaultShunterConfig) {
			return new (winston.transports.Console)({
				colorize: false,
				timestamp: true,
				level: 'debug'
			});
		};

		it('Confirm our colorize default config option is true by default', function() {
			var logger = require('../../../lib/logging')(defaultShunterConfig).getConfig();
			assert.isTrue(logger.transports.console.colorize);
		});

		it('Can override our colorize default config option', function() {
			var thisConfig = defaultShunterConfig;
			var logger = require('../../../lib/logging')(thisConfig).getConfig();
			assert.isFalse(logger.transports.console.colorize);

			console.log('==========================================')
			console.log(JSON.stringify(logger.transports))
			assert.isNotObject(logger.transports.syslog);
		});



	});

/*
	describe('Specifying an environment', function() {
		var env;

		beforeEach(function() {
			env = process.env.NODE_ENV;
			process.env.NODE_ENV = 'ci';

			mockery.enable({
				useCleanCache: true,
				warnOnUnregistered: false,
				warnOnReplace: false
			});
			mockery.registerMock('os', require('../mocks/os'));
		});
		afterEach(function() {
			process.env.NODE_ENV = env;

			mockery.deregisterAll();
			mockery.disable();
		});

		it('Should be able to select the environment from an environment variable', function() {
			var config = require('../../../lib/config')(null, null, {});
			assert.equal(config.env.name, 'ci');
			assert.isFalse(config.env.isDevelopment());
			assert.isFalse(config.env.isProduction());
		});

		it('Should be able to override an environment variable', function() {
			var config = require('../../../lib/config')('production', null, {});
			assert.equal(config.env.name, 'production');
			assert.isTrue(config.env.isProduction());
			assert.isFalse(config.env.isDevelopment());
		});

	});
*/
});
