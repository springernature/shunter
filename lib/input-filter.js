
'use strict';

module.exports = function(config) {
	return {
		filters: [],

		getBase: function(data, key) {
			if (data && data.article && data.article[key]) {
				return data.article;
			}
			if (data && data[key]) {
				return data;
			}
			return null;
		},

		add: function(filter) {
			this.filters.push(filter);
		},

		run: function(req, res, data, callback) {
			var self = this;

			var runner = function(filters, data) {
				var remain;
				var filter;
				var arity;
				var cb;

				if (!filters.length) {
					callback(data);
				} else {
					filter = filters[0];
					remain = filters.slice(1);
					cb = function(data) {
						runner(remain, data);
					};
					arity = filter.length;

					if (arity === 1) {
						runner(remain, filter.call(self, data));
					} else if (arity === 2) {
						filter.call(self, data, cb);
					} else if (arity === 3) {
						filter.call(self, config, data, cb);
					} else if (arity === 5) {
						filter.call(self, config, req, res, data, cb);
					} else {
						config.log.error('Input filters must accept 1, 2, 3 or 5 arguments ' + arity + ' found');
						runner(remain, data);
					}
				}
			};
			runner(this.filters, data);
		}
	};
};
