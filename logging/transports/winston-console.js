'use strict';
var winston = require('winston');

var format = winston.format;

const myFormat = format.printf(function (logformMessage) {
	return `${logformMessage.timestamp} - ${logformMessage.level}: ${logformMessage.message}`;
});

module.exports = function (config) {
	return new (winston.transports.Console)({
		format: winston.format.combine(
			format.colorize(),
			format.timestamp(),
			myFormat
		),
		level: config.argv.logging
	});
};
