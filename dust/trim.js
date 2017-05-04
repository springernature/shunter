'use strict';

module.exports = initFilter;

function initFilter(dust) {
	dust.filters.trim = function (value) {
		return value.toString().trim();
	};
}
