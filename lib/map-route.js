
'use strict';

module.exports = function(address) {
	var url = require('url');

	// Regular Expression Object matches against IPv4
	var ipv4RegExp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

	var map = function(address) {
		var mappedRoute = {};
		var route;

		if (ipv4RegExp.test(address.split(':')[0])) {
			route = address.split(':');
			mappedRoute.host = route[0] && route[0].length >= 7 ? route[0] : null;
			mappedRoute.port = route[1] && route[1].length > 1 ? route[1] : null;
		} else {
			route = url.parse(address);
			mappedRoute.host = route.hostname || null;
			mappedRoute.port = route.port || null;
		}

		return mappedRoute;
	};

	return map(address);
};
