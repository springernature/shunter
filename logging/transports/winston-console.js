'use strict';
var winston = require('winston');
var format = require('winston').format;

var myFormat = format.printf(info => {
	return `${info.timestamp} - ${info.level}: ${info.message}`;
});

module.exports = function (config) {
	return new (winston.transports.Console)({
		format: format.combine(
			format.colorize(),
			format.timestamp(),
			myFormat
		),
		level: config.argv.logging
	});
};
