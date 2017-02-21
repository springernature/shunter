
'use strict';

module.exports = function(config) {
	var statsd = require('./statsd')(config);
	var filter = require('./output-filter')(config);
	var contentType = require('./content-type');
	var http = require('http');
	var errors = require('./errors')(config);

	return {
		send: function(err, out, req, res, status) {
			var timer = config.timer();
			var length = 0;
			var content;
			var mimeType;

			if (!status) {
				status = 200;
			}

			if (err) {
				status = err.status || 500;
				config.log.warn('************');
				config.log.warn(err);
				content = errors.errorRouter(err, out, req, res, status) || this.error(err, status);
				//content = this.error(err, status);
				config.log.warn('CONTENT SET');
			} else if (req.isJson) {
				content = out;
				mimeType = 'application/json; charset=utf-8';
			} else {
				content = filter(out, contentType(req.url), req);
			}

			if (!mimeType) {
				mimeType = contentType(req.url, {charset: 'utf-8'});
			}

			length = Buffer.byteLength(content);

			statsd.classifiedTiming(req.url, 'writing', timer('Writing response ' + req.url));
			statsd.classifiedGauge(req.url, 'response_size', length);
			statsd.increment('requests');

			res.setHeader('Content-type', mimeType);
			config.log.warn('HEADER SET');
			res.setHeader('Content-length', length);
			res.writeHead(status);
			config.log.warn('WRITTEN');
			res.end(content);
			config.log.warn('END');
		},
		error: function(err, status) {
			var message = (err.message || err.toString());

			var statusMessage = http.STATUS_CODES[status] || 'Internal server error';
			var out = [
				'<!DOCTYPE html><html lang="en"><head><title>' + statusMessage + '</title>',
				'</head>',
				'<body><div style="font-family: sans-serif; color: gray; font-size: 20px; font-weight: bold; margin-top: 200px; text-align: center;">' + status + ' &ndash; ' + statusMessage + '</div>',
				'\n<!--\n\n',
				function() {/*
                       ___    _                        _
                      / __|  | |_     _  _    _ _     | |_     ___      _ _
                      \__ \  | ' \   | +| |  | ' \    |  _|   / -_)    | '_|
                      |___/  |_||_|   \_,_|  |_||_|   _\__|   \___|   _|_|_
                    _|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|
                    "`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'
				*/}.toString().replace(/^[^\*]+\*/, '').replace(/\*\/.$/, ''),
				'\n\n\n',
				'Error: ' + message + '\n',
				'-->\n',
				'</body></html>'
			].join('');

			config.log.error(err.stack ? err.stack : message);
			statsd.increment('errors_' + status);

			return out;
		}
	};
};
