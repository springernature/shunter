'use strict';

var http = require('http');

// Promise-ified request. Does not handle POST.
module.exports = function (options) {
	return new Promise(function (resolve, reject) {
		var req = http.request(options, function (res) {
			res.setEncoding('utf8');

			if (res.statusCode < 200 || res.statusCode >= 300) {
				return reject(new Error('statusCode=' + res.statusCode));
			}
			var body = [];
			res.on('data', function(chunk) {
				body.push(chunk);
			});
			res.on('end', function() {
				res.text = body;
				resolve(res);
			});
		});

		req.on('error', function (error) {
			reject(error);
		});

		req.end();
	});
};
