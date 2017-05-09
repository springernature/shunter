
'use strict';

var path = require('path');
var eachModule = require('each-module');
var winston = require('winston');

module.exports = function(config) {
	// User-defined configurations take priority, but fallback to defaults if all seem invalid
	var getArrayOfValidModulesByDirName = function(finalDir) {
		var modules = [];
		var modulePusher = function(moduleName, moduleExports, file) {
			if (typeof moduleExports === 'function') {
				modules.push(moduleExports);
			} else {
				console.warn('Invalid module dropped ' + file);
			}
		};

		var locations = [config.path.root, config.path.shunterRoot]; // config.path.root = users files
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
		getConfig: function() {
			var validateTransports = function(arModules) {
				return arModules.map(function(fnModule) {
					return fnModule(config);
				}).filter(function(obModule) {
					return obModule ? true : false;
				});
			};

			var validateFilters = function(arModules) {
				return arModules.filter(function(fnModule) {
					return typeof fnModule('debug', 'a message') === 'string';
				});
			};

			var transports = getArrayOfValidModulesByDirName(config.structure.loggingTransports);
			var filters = getArrayOfValidModulesByDirName(config.structure.loggingFilters);

			return new winston.Logger({
				transports: validateTransports(transports),
				filters: validateFilters(filters)
			});
		}
	};
};
