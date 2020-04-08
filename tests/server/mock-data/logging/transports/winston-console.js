'use strict';
var winston = require('winston');

var format = winston.format;

module.exports = function (config) {
	return new (winston.transports.Console)({
		format: format.combine(
			format.colorize(),
			format.timestamp(),
		),
		level: 'THIS_IS_FINE'
	});
};
