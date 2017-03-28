
'use strict';

var path = require('path');
var eachModule = require('each-module');
var winston = require('winston');

module.exports = function(arg) {
	var config = arg;

	var getModulesArrayByDirName = function(finalDir) {
		var modules = [];
		var locations = [config.path.root, config.path.shunterRoot]; //config.path.root = userland files

		for (var i = 0; i < locations.length; i++) {
			var localPath = path.join(locations[i], config.structure.logging, finalDir);
			eachModule(localPath, function(modName, modExports) {
				if (typeof modExports === 'function') {
					modules.push(modExports);
				}
			});
			console.log('LEN='+modules.length + ' for '+ localPath);
			if (modules.length > 0) {
				break;
			}
		};
		return modules;
	};

	return {
		getDefaultConfig: function() {
			var instantiateValidModules = function(arModules, type) {
				return arModules.filter(function(possibleModule) {
					console.log('possibleModule='+ typeof possibleModule);
					console.log(possibleModule.constructor);
					return possibleModule && typeof possibleModule === 'function';
				}).map(function(t) {
					return t(config);
				})
			};

			var transports = getModulesArrayByDirName(config.structure.loggingTransports);
			var filters = getModulesArrayByDirName(config.structure.loggingFilters);
			return new winston.Logger({
				transports: instantiateValidModules(transports),
				filters: instantiateValidModules(filters)
			});
		}
	};
};
