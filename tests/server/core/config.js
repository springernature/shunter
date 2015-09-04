'use strict';

var assert = require('proclaim');
var mockery = require('mockery');

describe('Shunter configuration', function() {
	describe('No environment specified', function() {
		it('Should use development as the default environment', function() {
			var config = require('../../../lib/config')(null, null, {});
			assert.equal(config.env.name, 'development');
			assert.isTrue(config.env.isDevelopment());
			assert.isFalse(config.env.isProduction());
		});
	});

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
});
