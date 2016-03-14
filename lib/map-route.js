
'use strict';

module.exports = function(address) {
	var url = require('url');

	var parseUrl = function(address) {
		var protocol = url.parse(address).protocol || null;

		if (protocol === 'http:' || protocol === 'https:') {
			return url.parse(address);
		}

		return url.parse('http://' + address);
	};

	var map = function(address) {
		var mappedRoute = {};
		var route = parseUrl(address);

		mappedRoute.protocol = route.protocol || null;
		mappedRoute.host = route.hostname || null;
		mappedRoute.port = route.port || null;

		return mappedRoute;
	};

	return map(address);
};
