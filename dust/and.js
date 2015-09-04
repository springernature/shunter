'use strict';

var util = require('util');

module.exports = initHelper;

function initHelper(dust) {
	/*
	 * Add 'and' functionality to dust conditional testing
	 * evaluates to true if all of the keys are set in the data
	 * if not is set to true
	 * evaluates to true if none of the keys are set in the data
	 */
	dust.helpers.and = function(chunk, context, bodies, params) {
		params = params || {};
		var alternate = bodies.else;
		var keys = dust.helpers.tap(params.keys, chunk, context);
		var not = dust.helpers.tap(params.not, chunk, context);

		var checkContext = function(arr) {
			// jshint maxcomplexity: 7

			var count = 0;
			var item;
			var nestedKeys;
			for (var i = 0; arr[i]; ++i) {
				nestedKeys = arr[i].split('.');
				item = context.get(nestedKeys.shift());
				// handle finding nested properties like foo.bar
				while (nestedKeys.length > 0 && item) {
					item = item[nestedKeys.shift()];
				}
				if (item && (!util.isArray(item) || item.length > 0)) {
					++count;
				}
			}
			return ((typeof not === 'undefined' || not === 'false') && count === arr.length) ||
				((typeof not !== 'undefined' && not === 'true') && count === 0);
		};

		if (checkContext(keys.split('|'))) {
			return chunk.render(bodies.block, context);
		}
		if (alternate) {
			return chunk.render(alternate, context);
		}
		return chunk;
	};
}
