'use strict';

module.exports = initHelper;

function initHelper(dust) {
	dust.helpers.numberFormat = function (chunk, context, bodies, params) {
		let num = context.resolve(params.num);
		if (num) {
			return chunk.write(num.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
		}
		return chunk.write(num);
	};
}
