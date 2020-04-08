'use strict';

var path = require('path');
var eachModule = require('each-module');
var winston = require('winston');

module.exports = function (config) {
	var moduleLoadErrors = [];

	var getArrayOfValidModulesByDirName = function (finalDir) {
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
			var localPath = path.join(locations[i], config.structure.logging, finalDir);
			eachModule(localPath, modulePusher);
			if (modules.length > 0) {
				break;
			}
		}
		return modules;
	};

	return {
		getLogger: function () {
			var validateTransports = function (arModules) {
				return arModules.map(function (fnModule) {
					return fnModule(config);
				}).filter(function (obModule) {
					return Boolean(obModule);
				});
			};

			var transports = getArrayOfValidModulesByDirName(config.structure.loggingTransports);
			var loggerInstance = new winston.createLogger({
				transports: validateTransports(transports)
			});

			moduleLoadErrors.forEach(function (err) {
				loggerInstance.error(err);
			});

			return loggerInstance;
		}
	};
};
