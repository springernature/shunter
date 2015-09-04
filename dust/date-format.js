'use strict';

var dateformat = require('dateformat');

module.exports = initHelper;

function initHelper(dust, renderer, config) {
	dust.helpers.dateFormat = function(chunk, context, bodies, params) {
		// jshint maxcomplexity: 7

		var date = null;
		var value = null;

		params = params || {};

		try {
			value = (params.date) ? dust.helpers.tap(params.date, chunk, context) : null;
			date = (value) ? new Date(value.match(/^[0-9]+$/) ? parseInt(value, 10) : value) : new Date();
			chunk.write(dateformat(date, params.format || 'yyyy-mm-dd'));
		} catch (e) {
			config.log.error(e.message);
		}
		return chunk;
	};
}
