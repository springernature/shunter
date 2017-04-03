
'use strict';

var path = require('path');
var eachModule = require('each-module');
var winston = require('winston');

module.exports = function(config) {
	// userland configs take prio but fallback to defaults if seemingly invalid
	var getArrayOfValidModulesByDirName = function(finalDir) {
		var modules = [];
		var modulePusher = function(moduleName, moduleExports, file) {
			if (typeof moduleExports === 'function') {
				modules.push(moduleExports);
			} else {
				console.warn('Invalid module dropped ' + file);
			}
		};

		var locations = [config.path.root, config.path.shunterRoot]; // config.path.root = userland files
		for (var i = 0; i < locations.length; i++) {
			var localPath = path.join(locations[i], config.structure.logging, finalDir);
			eachModule(localPath, modulePusher);
			console.log('LEN=' + modules.length + ' for ' + localPath); // TODO rm me
			if (modules.length > 0) {
				break;
			}
		}
		return modules;
	};

	return {
		getConfig: function() {
			var instantiateModules = function(arModules) {
				return arModules.map(function(fnModule) {
					return fnModule(config);
				}).filter(function(obModule){
					return !!obModule // enure when fn invoked it returns something truthy
				});
			};

			var transports = getArrayOfValidModulesByDirName(config.structure.loggingTransports);
			var filters = getArrayOfValidModulesByDirName(config.structure.loggingFilters);
			return new winston.Logger({
				transports: instantiateModules(transports),
				filters: instantiateModules(filters)
			});
		}
	};
};
