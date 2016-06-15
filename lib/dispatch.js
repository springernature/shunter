
'use strict';

module.exports = function(config) {
	var statsd = require('./statsd')(config);
	var filter = require('./output-filter')(config);
	var contentType = require('./content-type');

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
				content = this.error(err, status);
			} else if (req.isJson) {
				content = out;
				mimeType = 'application/json';
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
			res.setHeader('Content-length', length);
			res.writeHead(status);

			console.log('Shunter responded with ' + status);
			console.log('... and content: ' + content);

			res.end(content);
		},
		error: function(err, status) {
			var message = (err.message || err.toString());

			var statusMessage = 'Internal server error';
			var out = '';
			if (status === 404) {
				statusMessage = 'Not found';
			}
			// out should be undefined for 500-504 errors, handled by the vhost config
			if (status < 500 || status >= 505) {
				out = [
					'<!DOCTYPE html><html lang="en"><head><title>' + statusMessage + '</title>',
					'<script src="//nexus.ensighten.com/npg/Bootstrap.js"></script>',
					'<meta name="WT.z_status_code" content="' + status + '" />',
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
					'<noscript>',
					'<img alt="" id="DCSIMG" width="1" height="1" src="http://statse.webtrendslive.com/dcs0zztfg00000s969s37qoal_2f6z/njs.gif?dcsuri=/nojavascript&amp;WT.js=No&amp;WT.tv=10.2.55" />',
					'</noscript>',
					'</body></html>'
				].join('');
			}

			config.log.error(err.stack ? err.stack : message);
			statsd.increment('errors_' + status);

			return out;
		}
	};
};
