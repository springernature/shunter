'use strict';

var assert = require('proclaim');
var winston = require('winston');

describe('Shunter logging config,', function () {
	var defaultShunterConfig = {
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
			loggingFilters: 'filters',
			loggingTransports: 'transports'
		},
		syslogAppName: 'foo'
	};

	describe('With no logging config provided,', function () {
		it('Should offer getLogger() in its API', function () {
			var loggingInstance = require('../../../lib/logging')(defaultShunterConfig);
			assert.isFunction(loggingInstance.getLogger);
		});

		it('Should load the winston console transport', function () {
			var logger = require('../../../lib/logging')(defaultShunterConfig).getLogger();
			console.log('logger.transports in test')
			console.log(logger.transports)
			assert.isObject(logger.transports.console);
		});

		it('Should load the winston syslog transport', function () {
			var logger = require('../../../lib/logging')(defaultShunterConfig).getLogger();
			assert.isObject(logger.transports.syslog);
		});

		it('Should not load any filters by default', function () {
			var logger = require('../../../lib/logging')(defaultShunterConfig).getLogger();
			assert.isObject(logger.filters);
			assert.strictEqual(logger.filters.length, 0);
		});
	});

	describe('With an argv log level for console transport provided,', function () {
		it('Should respect a log level argv', function () {
			var thisConfig = defaultShunterConfig;
			thisConfig.argv.logging = 'someValue';

			var logger = require('../../../lib/logging')(thisConfig).getLogger();
			assert.strictEqual(logger.transports.console.level, 'someValue');
		});
	});

	describe('With syslog not required,', function () {
		it('Should not load syslog if argv.syslog is falsy', function () {
			var thisConfig = defaultShunterConfig;
			delete thisConfig.argv.syslog;
			var logger = require('../../../lib/logging')(thisConfig).getLogger();
			assert.isNotObject(logger.transports.syslog);
		});

		it('Should not load syslog if syslogAppName is falsy', function () {
			var thisConfig = defaultShunterConfig;
			delete thisConfig.syslogAppName;
			var logger = require('../../../lib/logging')(thisConfig).getLogger();
			assert.isNotObject(logger.transports.syslog);
		});
	});

	describe('With user-provided logging config provided via args,', function () {
		var appJSLogConfig = new winston.createLogger({
			transports: [
				new (winston.transports.Console)({
					colorize: false
				})
			],
			filters: [
				function (level, msg) {
					return 'filtered: ' + msg;
				}
			]
		});

		it('First confirms the test colorize config option defaults to true', function () {
			var logger = require('../../../lib/logging')(defaultShunterConfig).getLogger();
			assert.isTrue(logger.transports.console.colorize);
		});

		it('Can override our default config via app.js/args to config.js', function () {
			var thisConfig = defaultShunterConfig;
			thisConfig.log = appJSLogConfig;

			var parsedConfig = require('../../../lib/config')(thisConfig.env, thisConfig, {});
			assert.isFalse(parsedConfig.log.transports.console.colorize);
		});

		it('Should respect filters passed via app.js/args to config.js', function () {
			var thisConfig = defaultShunterConfig;
			thisConfig.log = appJSLogConfig;

			var parsedConfig = require('../../../lib/config')(thisConfig.env, thisConfig, {});
			assert.isObject(parsedConfig.log.filters);
			assert.strictEqual(parsedConfig.log.filters.length, 1);
			assert.isTypeOf(parsedConfig.log.filters[0], 'function');
		});
	});

	describe('With user-provided logging config provided via files,', function () {
		var mockedLogger;
		beforeEach(function () {
			var thisConfig = defaultShunterConfig;
			thisConfig.path.root = './tests/server/mock-data';
			mockedLogger = require('../../../lib/logging')(thisConfig).getLogger();
		});

		it('Can override our default config via provided files', function () {
			assert.isFalse(mockedLogger.transports.console.colorize);
		});

		it('Should not use broken user transport files', function () {
			assert.isNotObject(mockedLogger.transports.syslog);
			// One dropped transport out of two should leave one valid transport
			assert.strictEqual(Object.keys(mockedLogger.transports).length, 1);
		});

		it('Should use user filter files', function () {
			assert.strictEqual(mockedLogger.filters[0]('info', 'water'), 'filtered: water');
		});
	});
});
