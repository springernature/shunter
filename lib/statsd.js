
'use strict';

module.exports = function(config) {
	var StatsD = require('node-statsd').StatsD;
	var client = new StatsD(config.statsd);
	var mappings = (config.statsd && config.statsd.mappings ? config.statsd.mappings : []).map(function(item) {
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
		'set',
		'unique'
	];

	var obj = {
		buildMetricNameForUrl: function(url, name) {
			if (!mappings.length) {
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

	client.socket.on('error', function(err) {
		return config.log.error('Error in socket: ', err);
	});

	methods.forEach(function(method) {
		var meth = 'classified' + method.charAt(0).toUpperCase() + method.substring(1);

		obj[method] = client[method].bind(client);
		obj[meth] = function(url, name) {
			var args = slice.call(arguments, 1);
			args[0] = obj.buildMetricNameForUrl(url, name);
			client[method].apply(client, args);
		};
	});

	return obj;
};
