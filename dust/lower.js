'use strict';

module.exports = initFilter;

function initFilter(dust) {
	dust.filters.lower = function (value) {
		return value.toLowerCase();
	};
}
