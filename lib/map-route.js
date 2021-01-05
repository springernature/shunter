'use strict';

module.exports = function (address) {
	const url = require('url');

	const parseUrl = function (address) {
		const protocol = url.parse(address).protocol || null;

		if (protocol === 'http:' || protocol === 'https:') {
			return url.parse(address);
		}

		return url.parse('http://' + address);
	};

	const map = function (address) {
		const route = parseUrl(address);
		let mappedRoute = {};

		mappedRoute.protocol = route.protocol || null;
		mappedRoute.host = route.hostname || null;
		mappedRoute.port = route.port || null;

		return mappedRoute;
	};

	return map(address);
};
