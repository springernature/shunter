
'use strict';

module.exports = function(config) {
	var statsd = require('./statsd')(config);

	return function(req, res, next) {
		var timer = config.timer();
		var end = res.end;

		res.end = function() {
			statsd.classifiedTiming(req.url, 'response_time', timer('Request completed ' + req.url));
			end.apply(res, Array.prototype.slice.call(arguments, 0));
		};
		next();
	};
};
