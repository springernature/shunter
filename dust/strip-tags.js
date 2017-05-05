'use strict';

module.exports = initFilter;

function initFilter(dust) {
	dust.filters.stripTags = function (value) {
		return value.replace(/<[^>]+>/g, '');
	};
	dust.filters.strip = dust.filters.stripTags;
}
