
'use strict';

var path = require('path');
var eachModule = require('each-module');
var winston = require('winston');

module.exports = function(arg) {
	var config = arg;
	var loadConfiguration = function(dir) {
		var modules = [];
		// TODO user files in config.path.root
		var transportsPath = path.join(config.path.shunterRoot, config.structure.logging, dir);
		eachModule(transportsPath, function(modName, modExports) {
			modules.push(modExports);
		});
		console.log('LEN='+modules.length + ' for '+ transportsPath);
		return modules;
	};

	var api = {
		getDefaultConfig: function() {
			return new winston.Logger({
				transports: loadConfiguration(config.structure.loggingTransports).map(function(t) {
					return t(config);
				}).filter(function(t) {
					return !!t;
				}),
				filters: loadConfiguration(config.structure.loggingFilters)
			});
		}
	};

	return api;
};
