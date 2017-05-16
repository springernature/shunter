'use strict';
var winston = require('winston');

module.exports = function (config) {
	return new (winston.transports.Console)({
		colorize: true,
		timestamp: true,
		level: config.argv.logging
	});
};
