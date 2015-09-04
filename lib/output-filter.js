
'use strict';

var path = require('path');
var eachModule = require('each-module');

module.exports = function(config) {
	var filters = [];

	var modulePaths = config.modules.map(function(module) {
		return path.join(config.path.root, 'node_modules', module);
	});
	modulePaths.push(config.path.root);
	modulePaths.unshift(config.path.shunterRoot);

	modulePaths.forEach(function(modulePath) {
		var filterPath = path.join(modulePath, config.structure.filters, config.structure.filtersOutput);
		eachModule(filterPath, function(name, runFilter) {
			filters.push(runFilter);
		});
	});

	return function(content, contentType, req) {
		var output;

		for (var i = 0; filters[i]; ++i) {
			output = filters[i](content, contentType, req, config);
			if (typeof output === 'string') {
				content = output;
			}
		}
		return content;
	};
};
