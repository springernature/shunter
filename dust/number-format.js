'use strict';

module.exports = initHelper;

function initHelper(dust) {
	dust.helpers.numberFormat = function(chunk, context, bodies, params) {
		var num = dust.helpers.tap(params.num, chunk, context);
		if (num) {
			return chunk.write(num.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
		}
		return chunk.write(num);
	};
}
