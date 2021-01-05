'use strict';

const path = require('path');
const eachModule = require('each-module');

module.exports = function (config) {
	let filters = [];

	const modulePaths = config.modules.map(function (module) {
		return path.join(config.path.root, 'node_modules', module);
	});
	modulePaths.push(config.path.root);
	modulePaths.unshift(config.path.shunterRoot);

	modulePaths.forEach(function (modulePath) {
		const filterPath = path.join(modulePath, config.structure.filters, config.structure.filtersOutput);
		eachModule(filterPath, function (name, runFilter) {
			filters.push(runFilter);
		});
	});

	return function (content, contentType, req) {
		let output;

		for (let i = 0; filters[i]; ++i) {
			output = filters[i](content, contentType, req, config);
			if (typeof output === 'string') {
				content = output;
			}
		}
		return content;
	};
};
