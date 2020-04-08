'use strict';
var winston = require('winston');
// TODO this does not look much like a mock...
module.exports = function (config) {
	return new (winston.transports.Console)({
		colorize: false,
		timestamp: true,
		level: config.argv.logging
	});
};
