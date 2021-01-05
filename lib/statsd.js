'use strict';

module.exports = function (config) {
	const SDC = require('statsd-client');
	const client = new SDC(config.statsd);

	const mappings = (config.statsd && config.statsd.mappings ? config.statsd.mappings : []).map(function (item) {
		if (item.pattern && typeof item.pattern === 'string') {
			item.pattern = new RegExp(item.pattern);
		}
		return item;
	});

	const methods = [
		'timing',
		'increment',
		'decrement',
		'histogram',
		'gauge',
		'gaugeDelta',
		'set'
	];

	const obj = {
		buildMetricNameForUrl: function (url, name) {
			if (mappings.length === 0) {
				return name;
			}
			for (let i = 0; mappings[i]; ++i) {
				if (url.match(mappings[i].pattern)) {
					return name + '_' + mappings[i].name;
				}
			}
			return name;
		}
	};
	const slice = Array.prototype.slice;

	const noop = function () { };
	const mock = config && config.statsd ? config.statsd.mock : true;

	methods.forEach(function (method) {
		const prefixedMethod = 'classified' + method.charAt(0).toUpperCase() + method.substring(1);

		obj[method] = (mock) ? noop : client[method].bind(client);
		obj[prefixedMethod] = (mock) ? noop : function (url, name) {
			const args = slice.call(arguments, 1);
			args[0] = obj.buildMetricNameForUrl(url, name);
			client[method].apply(client, args);
		};
	});

	return obj;
};
