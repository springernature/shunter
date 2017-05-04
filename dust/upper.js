'use strict';

module.exports = initFilter;

function initFilter(dust) {
	dust.filters.upper = function (value) {
		return value.toUpperCase();
	};
}
