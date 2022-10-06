'use strict';

module.exports = function (config) {
	var extend = require('extend');
	var mapRoute = require('./map-route');
	var routes = config.routes;
	var defaultRoute = config.argv['route-config'] || 'default';
	var localhost = {};
	var override;

	if (config.argv['origin-override']) {
		localhost.changeOrigin = true;
	}

	if (config.argv['route-override']) {
		override = mapRoute(config.argv['route-override']);
		if (override.host) {
			routes = {localhost: {default: ''}};
			routes.localhost.default = extend(true, {}, localhost, override);
			defaultRoute = 'default';
		}
	}

	var matchRoute = function (pattern, url) {
		if (pattern.match(/^\/.+?\/$/)) {
			return url.match(new RegExp(pattern.replace(/^\//, '').replace(/\/$/, ''), 'i'));
		}
		return false;
	};

	return {
		map: function (domain, url) {
			domain = domain.replace(/:\d+$/, '');
			if (!Object.prototype.hasOwnProperty.call(routes, domain)) {
				domain = 'localhost';
			}
			if (!Object.prototype.hasOwnProperty.call(routes, domain)) {
				return null;
			}
			for (var pattern in routes[domain]) {
				if (pattern !== defaultRoute && Object.prototype.hasOwnProperty.call(routes[domain], pattern)) {
					if (matchRoute(pattern, url)) {
						return routes[domain][pattern];
					}
				}
			}
			return routes[domain][defaultRoute];
		}
	};
};
