'use strict';

module.exports = function (config) {
	var SDC = require('statsd-client');
	var client = new SDC(config.statsd);

	var mappings = (config.statsd && config.statsd.mappings ? config.statsd.mappings : []).map(function (item) {
		if (item.pattern && typeof item.pattern === 'string') {
			item.pattern = new RegExp(item.pattern);
		}
		return item;
	});

	var methods = [
		'timing',
		'increment',
		'decrement',
		'histogram',
		'gauge',
		'gaugeDelta',
		'set'
	];

	var obj = {
		buildMetricNameForUrl: function (url, name) {
			if (mappings.length === 0) {
				return name;
			}
			for (var i = 0; mappings[i]; ++i) {
				if (url.match(mappings[i].pattern)) {
					return name + '_' + mappings[i].name;
				}
			}
			return name;
		}
	};
	var slice = Array.prototype.slice;

	var noop = function () { };
	var mock = config && config.statsd ? config.statsd.mock : true;

	methods.forEach(function (method) {
		var prefixedMethod = 'classified' + method.charAt(0).toUpperCase() + method.slice(1);

		obj[method] = (mock) ? noop : client[method].bind(client);
		obj[prefixedMethod] = (mock) ? noop : function (url, name) {
			var args = slice.call(arguments, 1);
			args[0] = obj.buildMetricNameForUrl(url, name);
			client[method].apply(client, args);
		};
	});

	return obj;
};
