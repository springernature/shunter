'use strict';

var assert = require('proclaim');
var winston = require('winston');

describe('Shunter logging configuration', function() {

	var defaultShunterConfig = {
		argv: {
			syslog: true,
			logging: 'info'
		},
		env: {
			host: function() {
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

	describe('No logging config provided', function() {
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

		it('Should not load any filters by default', function() {
			var logger = require('../../../lib/logging')(defaultShunterConfig).getConfig();
			assert.isObject(logger.filters);
			assert.strictEqual(logger.filters.length, 0);
		});
	});

	describe('Provide configurable log level for default Console transport', function() {
		it('Should respect a log level argv', function() {
			var thisConfig = defaultShunterConfig;
			thisConfig.argv.logging = 'someValue';

			var logger = require('../../../lib/logging')(thisConfig).getConfig();
			assert.strictEqual(logger.transports.console.level, 'someValue');
		});
	});

	describe('syslog not required', function() {
		it('Should not load syslog if argv.syslog is falsy', function() {
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
		var appJSLogConfig = new winston.Logger({
			transports: [
				new (winston.transports.Console)({
					colorize: false
				})
			],
			filters: [
				function(level, msg) {
					return 'filtered: ' + msg;
				}
			]
		});

		it('First confirms our colorize config option defaults to true', function() {
			var logger = require('../../../lib/logging')(defaultShunterConfig).getConfig();
			assert.isTrue(logger.transports.console.colorize);
		});

		it('Can override our default config via app.js/args to config.js', function() {
			var thisConfig = defaultShunterConfig;
			thisConfig.log = appJSLogConfig;

			var parsedConfig = require('../../../lib/config')(thisConfig.env, thisConfig, {});
			assert.isFalse(parsedConfig.log.transports.console.colorize);
		});

		it('Should respect filters passed via app.js/args to config.js', function() {
			var thisConfig = defaultShunterConfig;
			thisConfig.log = appJSLogConfig;

			var parsedConfig = require('../../../lib/config')(thisConfig.env, thisConfig, {});
			assert.isObject(parsedConfig.log.filters);
			assert.strictEqual(parsedConfig.log.filters.length, 1);
			assert.isTypeOf(parsedConfig.log.filters[0], 'function');
		});

		it('Can override our default config via provided files', function() {
			var thisConfig = defaultShunterConfig;
			thisConfig.path.root = './tests/server/mock-data';

			var logger = require('../../../lib/logging')(thisConfig).getConfig();
			assert.isFalse(logger.transports.console.colorize);
		});

		it('Should not use broken user transport/filter files', function() {
			var thisConfig = defaultShunterConfig;
			thisConfig.path.root = './tests/server/mock-data'; // includes a broken syslog transport module

			var logger = require('../../../lib/logging')(thisConfig).getConfig();
			assert.isNotObject(logger.transports.syslog);
			// one dropped transport out of two should leave one valid transport
			assert.strictEqual(Object.keys(logger.transports).length, 1);
		});

	});
});
