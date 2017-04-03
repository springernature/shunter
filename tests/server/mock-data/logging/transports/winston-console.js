'use strict';
var winston = require('winston');

module.exports = function(config) {
	return new (winston.transports.Console)({
		colorize: false,
		timestamp: true,
		level: config.argv.logging
	});
};
