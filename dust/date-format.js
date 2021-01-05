'use strict';

const dateformat = require('dateformat');

module.exports = initHelper;

function initHelper(dust, renderer, config) {
	dust.helpers.dateFormat = function (chunk, context, bodies, params) {
		let date = null;
		let value = null;

		params = params || {};

		try {
			value = (params.date) ? context.resolve(params.date) : null;
			date = (value) ? new Date(value.match(/^\d+$/) ? parseInt(value, 10) : value) : new Date();
			chunk.write(dateformat(date, params.format || 'yyyy-mm-dd'));
		} catch (err) {
			config.log.error(err.message);
		}
		return chunk;
	};
}
