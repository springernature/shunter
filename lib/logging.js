'use strict';

var path = require('path');
var eachModule = require('each-module');
var winston = require('winston');

// Console minimum exposed level was configurable
// Syslog was hardcoded at level 'debug' (noisiest)
// Console always present
// Syslog added to transports if requested

//
/*
	return new (require('winston-syslog').Syslog)({
		localhost: config.env.host(),
		app_name: config.syslogAppName, // eslint-disable-line camelcase
		level: 'debug'
	});

	return new (winston.transports.Console)({
		colorize: true,
		timestamp: true,
		level: config.argv.logging
	});
*/

module.exports = function (config) {
	var loggerInstance;
	var moduleLoadErrors = [];

	var getArrayOfValidModulesByDirName = function (transportsDirName) {
		var modules = [];
		var modulePusher = function (moduleName, moduleExports, file) {
			if (typeof moduleExports === 'function') {
				modules.push(moduleExports);
			} else {
				moduleLoadErrors.push('Invalid logging transport dropped ' + file);
			}
		};

		// User-defined transports take priority, but fallback to defaults if all seem invalid
		var locations = [config.path.root, config.path.shunterRoot]; // config.path.root = users files
		for (var i = 0; i < locations.length; i++) {
			var localPath = path.join(locations[i], config.structure.logging, transportsDirName);
			eachModule(localPath, modulePusher);
			if (i === 0 && modules.length > 0) {
				// the user supplied at least one valid-looking transport
				break;
			}
		}
		return modules;
	};

	return {
		getLogger: function () {
			if (loggerInstance) {
				return loggerInstance;
			}

			var getTransports = function (modules) {
				return modules.map(function (fnModule) {
					return fnModule(config);
				}).filter(function (module) {
					return Boolean(module);
				});
			};

			var transports = getArrayOfValidModulesByDirName(config.structure.loggingTransports);

			// PROBLEM: levels now configured in the logger, not the transports.
			// https://github.com/winstonjs/winston-syslog#log-levels
			loggerInstance = winston.createLogger({
				// levels: winston.config.syslog.levels, // incorrect for e.g. console
				transports: getTransports(transports)
			});

			moduleLoadErrors.forEach(function (err) {
				loggerInstance.error(err);
			});

			return loggerInstance;
		}
	};
};
