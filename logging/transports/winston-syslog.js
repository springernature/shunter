'use strict';
var winston = require('winston');

module.exports = function(config) {
	console.log('---- Checking syslog config');
	console.log(config.argv.syslog);
	console.log(config.syslogAppName);
	if (!config.argv.syslog || !config.syslogAppName) {
		return null;
	}
	console.log('---- SYSLOGGIN ok for '+ config.env.host());
	// TODO there are no tests for syslog...
	// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
	require('winston-syslog');
	return new (winston.transports.Syslog)({
		localhost: config.env.host(),// hostname,
		app_name: config.syslogAppName,
		level: 'debug'
	});
};
