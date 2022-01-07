'use strict';

var path = require('path');
var eachModule = require('each-module');
var winston = require('winston');

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

			loggerInstance = winston.createLogger({
				transports: getTransports(transports)
			});

			moduleLoadErrors.forEach(function (err) {
				loggerInstance.error(err);
			});

			return loggerInstance;
		}
	};
};
