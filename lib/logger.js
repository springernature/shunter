
'use strict';

var path = require('path');
var eachModule = require('each-module');
var winston = require('winston');

module.exports = function(arg) {
	var config = arg;
	var getModulesArrayByDirName = function(finalDir) {
		var modules = [];
		[config.path.root, config.path.shunterRoot].forEach( //config.path.root = userland files
			function(root) {
				var localPath = path.join(root, config.structure.logging, finalDir);
				eachModule(localPath, function(modName, modExports) {
					modules.push(modExports);
				});
				console.log('LEN='+modules.length + ' for '+ localPath);
				if (modules.length > 0) {
					return modules;
				}
			}
		);
		return modules;
	};

	return {
		getDefaultConfig: function() {
			var instantiateValidModules = function(arModules) {
				return arModules.map(function(t) {
					return t(config);
				}).filter(function(t) {
					return !!t;
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
