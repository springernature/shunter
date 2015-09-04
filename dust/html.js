'use strict';

module.exports = initFilter;

function initFilter(dust) {
	dust.filters.html = function(value) {
		var escapes = {
			'<': '&#60;',
			'>': '&#62;',
			'"': '&#34;',
			'\'': '&#39;'
		};
		return dust.filters.amp(value).replace(/[<>"']/g, function(match) {
			return escapes[match];
		});
	};
}
