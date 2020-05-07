'use strict';
var winston = require('winston');
var Syslog = require('winston-syslog').Syslog;

module.exports = function (config) {
	if (!config.argv.syslog || !config.syslogAppName) {
		return null;
	}

	return new Syslog({
		localhost: config.env.host(),
		app_name: config.syslogAppName, // eslint-disable-line camelcase
		level: 'debug'
	});
};
