'use strict';

module.exports = function (config) {
	if (!config.argv.syslog || !config.syslogAppName) {
		return null;
	}

	return new (require('winston-syslog').Syslog)({
		localhost: config.env.host(),
		app_name: config.syslogAppName // eslint-disable-line camelcase
		// TODO level removed, checkme
	});
};
