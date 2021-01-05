'use strict';

module.exports = function (config) {
	const statsd = require('./statsd')(config);
	const outputFilter = require('./output-filter')(config);
	const contentType = require('./content-type');
	const http = require('http');

	const getErrorMessage = function (err) {
		return err.message || err.toString();
	};

	const api = {
		send: function (err, out, req, res, status) {
			const timer = config.timer();
			let mimeType;

			const logError = function (err, status) {
				config.log.error(err.stack ? err.stack : getErrorMessage(err));
				statsd.increment('errors_' + status);
			};

			const doSend = function (content) {
				const length = Buffer.byteLength(content);
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

			const getErrorContent = function (err, req, res) {
				mimeType = contentType('anything.html', {charset: 'utf-8'});
				require('./error-pages')(config).getPage(err, req, res, function (content) {
					doSend(content || api.error(err, status));
				});
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
			const statusMessage = http.STATUS_CODES[status] || 'Internal server error';
			const out = [
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
