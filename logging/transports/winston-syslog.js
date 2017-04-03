'use strict';
var winston = require('winston');

module.exports = function(config) {
	if (!config.argv.syslog || !config.syslogAppName) {
		return null;
	}
	// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
	require('winston-syslog');
	return new (winston.transports.Syslog)({
		localhost: config.env.host(),
		app_name: config.syslogAppName,
		level: 'debug'
	});
};
