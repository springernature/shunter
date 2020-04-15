'use strict';

// to run just these tests:
// ./node_modules/.bin/mocha  --opts ./tests/mocha.opts ./tests/server/core/logging.js

var assert = require('proclaim');
var winston = require('winston');
var Syslog = require('winston-syslog').Syslog;

describe('Logging config,', function () {
	var systemUnderTest = require('../../../lib/logging');
	var config;

	function getTransport(logger, type) {
		return logger.transports.find(function (element) {
			return element instanceof type;
		});
	}

    beforeEach(function () {
		config = {
			argv: {
				syslog: true,
				logging: 'info'
			},
			env: {
				host: function () {
					return 'some.host.name';
				}
			},
			log: require('../mocks/log'),
			path: {
				root: '/location-of-userland-files',
				shunterRoot: './'
			},
			structure: {
				logging: 'logging',
				loggingTransports: 'transports'
			},
			syslogAppName: 'foo'
		};

	});

	describe('With no logging config provided,', function () {
		it('Should offer getLogger() in its API', function () {
			var loggingInstance = systemUnderTest(config);
			assert.isFunction(loggingInstance.getLogger);
			/*
			console.log(winston.config.syslog.levels)
			{ emerg: 0,
				alert: 1,
				crit: 2,
				error: 3,
				warning: 4,
				notice: 5,
				info: 6,
				debug: 7 }

			console.log(winston.config.npm.levels)
			{ error: 0,
				warn: 1,
				info: 2,
				http: 3,
				verbose: 4,
				debug: 5,
				silly: 6 }
				*/
		});

		it('Should load the winston console transport by default', function () {
			var logger = systemUnderTest(config).getLogger();
			var thisTransport = getTransport(logger, winston.transports.Console);
			assert.isTrue(thisTransport instanceof winston.transports.Console);
		});

		it('Should load the winston syslog transport by default', function () {
			var logger = systemUnderTest(config).getLogger();
			var thisTransport = getTransport(logger, Syslog);
			assert.isTrue(thisTransport instanceof Syslog);
		});
	});

	describe('With an argv log level for console transport provided,', function () {
		it('Should respect a log level argv', function () {
			config.argv.logging = 'someValue';

			var logger = systemUnderTest(config).getLogger();
			var thisTransport = getTransport(logger, winston.transports.Console);
			assert.strictEqual(thisTransport.level, 'someValue');
		});
	});

	describe('With syslog not required,', function () {
		it('Should not load syslog if !argv.syslog', function () {
			delete config.argv.syslog;
			var logger = systemUnderTest(config).getLogger();
			var thisTransport = getTransport(logger, Syslog);
			assert.isNotObject(thisTransport);
		});

		it('Should not load syslog if !syslogAppName', function () {
			delete config.syslogAppName;
			var logger = systemUnderTest(config).getLogger();
			var thisTransport = getTransport(logger, Syslog);
			assert.isNotObject(thisTransport);
		});
	});

	// A user can provide their own completely custom logger instance when the app
	//  is created. This instance is stored in the config object.
	describe('With user-provided logger instance,', function () {
		var format = winston.format;
		var userLoggerInstance = winston.createLogger({
			transports: [
				new (winston.transports.Console)({
					format: format.combine(
						format.colorize(),
						format.timestamp()
					),
					level: 'RUN_AROUND_SCREAMING'
				})
			]
		});

		it('First confirms the Console transport level is the default "info"', function () {
			var logger = systemUnderTest(config).getLogger();
			var thisTransport = getTransport(logger, winston.transports.Console);
			assert.strictEqual(thisTransport.level, 'info');
		});

		it('Can override Console transport level via dynamic logger instance', function () {
			var thisConfig = config;
			thisConfig.log = userLoggerInstance;

			var validatedConfigObject = require('../../../lib/config')(thisConfig.env, thisConfig, {});
			var thisTransport = getTransport(validatedConfigObject.log, winston.transports.Console);
			assert.strictEqual(thisTransport.level, 'RUN_AROUND_SCREAMING');
		});
	});

	describe('With file-based user-provided logging transports,', function () {
		var thisLogger;
		beforeEach(function () {
			var thisConfig = config;
			thisConfig.path.root = './tests/server/mock-data';
			// there should be two transport files in that^ dir, and only one should be valid
			thisLogger = systemUnderTest(thisConfig).getLogger();
		});

		it('Can override our default config via provided files', function () {
			var thisTransport = getTransport(thisLogger, winston.transports.Console);
			assert.strictEqual(thisTransport.level, 'THIS_IS_FINE');
		});

		it('Should not use user transport files that do not expose a function', function () {
			// a basic check for mangled transport files
			var thisTransport = getTransport(thisLogger, Syslog);
			assert.isNotObject(thisTransport);
			// One dropped transport out of two should leave one valid transport
			assert.strictEqual(Object.keys(thisLogger.transports).length, 1);
		});
	});
});
