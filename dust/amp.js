'use strict';

module.exports = initFilter;

function initFilter(dust) {
	dust.filters.amp = function(value) {
		return value.replace(/&(?![#a-z0-9]+?;)/g, '&amp;');
	};
}
