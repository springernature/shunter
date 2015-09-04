'use strict';

module.exports = initFilter;

function initFilter(dust) {
	dust.filters.title = function(value) {
		return value.replace(/\w+/g, function(txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	};
}
