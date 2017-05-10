
'use strict';

module.exports = function (config) {
	var statsd = require('./statsd')(config);
	var outputFilter = require('./output-filter')(config);
	var contentType = require('./content-type');
	var http = require('http');

	var getErrorMessage = function (err) {
		return err.message || err.toString();
	};

	var api = {
		send: function (err, out, req, res, status) {
			var timer = config.timer();
			var mimeType;

			var logError = function (err, status) {
				config.log.error(err.stack ? err.stack : getErrorMessage(err));
				statsd.increment('errors_' + status);
			};

			var getErrorContent = function (err, req, res) {
				require('./error-pages')(config).getPage(err, req, res, function (content) {
					doSend(content || api.error(err, status));
				});
			};

			var doSend = function (content) {
				var length = Buffer.byteLength(content);
				if (!mimeType) {
					mimeType = contentType(req.url, {charset: 'utf-8'});
				}
				statsd.classifiedTiming(req.url, 'writing', timer('Writing response ' + req.url));
				statsd.classifiedGauge(req.url, 'response_size', length);
				statsd.increment('requests');

				res.setHeader('Content-type', mimeType);
				res.setHeader('Content-length', length);
				res.writeHead(status);
				res.end(content);
			};

			if (!status) {
				status = 200;
			}

			if (err) {
				status = err.status || 500;
				getErrorContent(err, req, res);
				logError(err, status);
			} else if (req.isJson) {
				mimeType = 'application/json; charset=utf-8';
				doSend(out);
			} else {
				doSend(outputFilter(out, contentType(req.url), req));
			}
		},
		error: function (err, status) {
			var statusMessage = http.STATUS_CODES[status] || 'Internal server error';
			var out = [
				'<!DOCTYPE html><html lang="en"><head><title>' + statusMessage + '</title>',
				'</head>',
				'<body><div style="font-family: sans-serif; color: gray; font-size: 20px; font-weight: bold; margin-top: 200px; text-align: center;">' + status + ' &ndash; ' + statusMessage + '</div>',
				'\n<!--\n\n',
				function () {/*
					   ___    _                        _
					  / __|  | |_     _  _    _ _     | |_     ___      _ _
					  \__ \  | ' \   | +| |  | ' \    |  _|   / -_)    | '_|
					  |___/  |_||_|   \_,_|  |_||_|   _\__|   \___|   _|_|_
					_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|
					"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'
				*/}.toString().replace(/^[^\*]+\*/, '').replace(/\*\/.$/, ''),
				'\n\n\n',
				'Error: ' + getErrorMessage(err) + '\n',
				'-->\n',
				'</body></html>'
			].join('');

			return out;
		}
	};

	return api;
};
