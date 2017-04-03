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
			host: function(){
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

		it('Should offer getDefaultConfig() in its API', function() {
			var loggingInstance = require('../../../lib/logging')(defaultShunterConfig);
			assert.isFunction(loggingInstance.getDefaultConfig);
		});

		it('Should load the winston console transport', function() {
			var logger = require('../../../lib/logging')(defaultShunterConfig).getDefaultConfig();
			assert.strictEqual(logger.transports.console.name, 'console');
		});

		it('Should load the winston syslog transport', function() {
			var logger = require('../../../lib/logging')(defaultShunterConfig).getDefaultConfig();
			console.log('==========================================')
			console.log(JSON.stringify(logger.transports))
			assert.strictEqual(logger.transports.syslog.name, 'syslog');
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
