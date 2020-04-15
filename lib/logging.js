'use strict';

var path = require('path');
var eachModule = require('each-module');
var winston = require('winston');

module.exports = function (config) {
	var moduleLoadErrors = [];

	var getArrayOfValidModulesByDirName = function (transportsDirName) {
		var modules = [];
		var modulePusher = function (moduleName, moduleExports, file) {
			if (typeof moduleExports === 'function') {
				modules.push(moduleExports);
			} else {
				moduleLoadErrors.push('Invalid module dropped ' + file);
			}
		};

		// User-defined configurations take priority, but fallback to defaults if all seem invalid
		var locations = [config.path.root, config.path.shunterRoot]; // Config.path.root = users files
		for (var i = 0; i < locations.length; i++) {
			var localPath = path.join(locations[i], config.structure.logging, transportsDirName);
			eachModule(localPath, modulePusher);
			if (modules.length > 0) {
				break;
			}
		}
		return modules;
	};

	return {
		getLogger: function () {
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
			var loggerInstance = winston.createLogger({
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
