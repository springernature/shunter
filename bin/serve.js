#!/usr/bin/env node
'use strict';

var path = require('path');
var jserve = require('jserve');
var query = require('qs-middleware');
var request = require('request');
var yargs = require('yargs');

// Parse command-line arguments
var args = yargs
	.options('p', {
		alias: 'port',
		default: 5401,
		type: 'number',
		describe: 'Port number'
	})
	.options('d', {
		alias: 'data',
		default: './data',
		type: 'string',
		describe: 'The path to look for sample data in'
	})
	.options('l', {
		alias: 'latency',
		default: 0,
		type: 'number',
		describe: 'Add milliseconds of latency to the request'
	})
	.alias('h', 'help')
	.help()
	.argv;

// Resolve the data directory against CWD if it's relative
if (args.data && !/^[\/\~]/.test(args.data)) {
	args.data = path.resolve(process.cwd(), args.data);
}

// Create a JServe application
// See https://github.com/rowanmanning/jserve
var app = jserve({
	contentType: 'application/x-shunter+json',
	log: {
		debug: console.log.bind(console),
		error: console.error.bind(console),
		info: console.log.bind(console)
	},
	middleware: [
		query(),
		addLatency,
		serveRemoteJson
	],
	name: 'Shunter Serve',
	path: args.data,
	port: args.port,
	templatesPath: __dirname + '/../view/jserve'
});

// Start the JServe application
app.start();

// Middleware to add latency to a response
function addLatency(request, response, next) {
	if (request.path === '/') {
		return next();
	}
	setTimeout(next, args.latency);
}

// Middleware to serve remote JSON
function serveRemoteJson(request, response, next) {
	if (request.path !== '/remote') {
		return next();
	}
	var options = {
		url: request.query.url,
		headers: request.query.headers
	};
	var error;

	if (!options.url || typeof options.url !== 'string') {
		error = new Error('Invalid query parameter: url');
		error.status = 400;
		return next(error);
	}

	if (options.headers && typeof options.headers !== 'string') {
		error = new Error('Invalid query parameter: headers');
		error.status = 400;
		return next(error);
	}

	options.headers = parseHeaders(options.headers);

	loadRemoteJson(options, function (error, json) {
		if (error) {
			return next(error);
		}
		response.writeHead(200, {
			'Content-Type': 'application/x-shunter+json'
		});
		response.end(JSON.stringify(json, null, 4));
	});
}

// Load remote JSON
function loadRemoteJson(options, done) {
	var requestOptions = {
		url: options.url,
		headers: options.headers
	};
	var error;

	request(requestOptions, function (err, response, body) {
		if (err) {
			return done(error);
		}
		if (response.statusCode < 200 || response.statusCode >= 300) {
			error = new Error('Remote JSON responded with ' + response.statusCode + ' status');
			error.status = response.statusCode;
			return done(error);
		}
		try {
			body = JSON.parse(body);
		} catch (err) {
			return done(err);
		}
		done(null, body);
	});
}

// Parse a HTTP header string
function parseHeaders(headerString) {
	var headers = {};
	var headersArray = headerString.split(/[\r\n]+/);
	headersArray.forEach(function (headerString) {
		var headerChunks = headerString.split(':');
		headers[headerChunks.shift().trim()] = headerChunks.join(':').trim();
	});
	return headers;
}
