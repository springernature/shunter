
'use strict';

module.exports = function(config) {
	var routes = config.routes;
	var defaultRoute = config.argv['route-config'] || 'default';
	var localhost = {};
	var override;

	if (config.argv['origin-override']) {
		localhost.changeOrigin = true;
	}

	if (config.argv['route-override']) {
		override = config.argv['route-override'].split(':');
		if (override[0].length > 7 && override[1].length > 1) {
			localhost.host = override[0];
			localhost.port = override[1];
			routes = {localhost: {default: ''}};
			routes.localhost.default = localhost;
			defaultRoute = 'default';
		}
	}

	var matchRoute = function(pattern, url) {
		if (pattern.match(/^\/.+?\/$/)) {
			return url.match(new RegExp(pattern.replace(/^\//, '').replace(/\/$/, ''), 'i'));
		}
		return false;
	};

	return {
		map: function(domain, url) {
			domain = domain.replace(/:[0-9]+$/, '');
			if (!routes.hasOwnProperty(domain)) {
				domain = 'localhost';
			}
			if (!routes.hasOwnProperty(domain)) {
				return null;
			}
			for (var pattern in routes[domain]) {
				if (pattern !== defaultRoute && routes[domain].hasOwnProperty(pattern)) {
					if (matchRoute(pattern, url)) {
						return routes[domain][pattern];
					}
				}
			}
			return routes[domain][defaultRoute];
		}
	};
};
