'use strict';

var qs = require('qs');

module.exports = function (config, req, res, data, next) {
	var cast = function (params) {
		var output = {};

		params = params || {};

		var transform = function (value) {
			var val = (typeof value === 'string') ? value.toLowerCase() : value;
			if (val === 'true' || val === 'false') {
				return val === 'true';
			}
			if (/^\d+(\.\d+)?$/.test(val)) {
				return parseInt(val, 10);
			}
			return value;
		};

		Object.keys(params).forEach(function (key) {
			if (Array.isArray(params[key])) {
				output[key] = params[key].map(transform);
			} else {
				output[key] = transform(params[key]);
			}
		});
		return output;
	};

	/* eslint-disable camelcase */
	data.query_data = cast(req.query);
	data.query_string = qs.stringify(data.query_data);
	data.request_url = (req.url) ? req.url.replace(/\?.*$/, '') : '';
	/* eslint-enable camelcase */

	next(data);
};
