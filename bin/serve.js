#!/usr/bin/env node
'use strict';

const path = require('path');
const jserve = require('jserve');
const query = require('qs-middleware');
const request = require('request');
const yargs = require('yargs');

// Parse command-line arguments
const args = yargs
	.options('p', {
		alias: 'port',
		nargs: 1,
		default: 5401,
		type: 'number',
		describe: 'Port number'
	})
	.options('d', {
		alias: 'data',
		nargs: 1,
		default: './data',
		type: 'string',
		describe: 'The path to look for sample data in'
	})
	.options('l', {
		alias: 'latency',
		nargs: 1,
		default: 0,
		type: 'number',
		describe: 'Add milliseconds of latency to the request'
	})
	.options('i', {
		alias: 'index',
		default: false,
		type: 'boolean',
		describe: 'Serve static JSON at the index path'
	})
	.options('q', {
		alias: 'query',
		default: false,
		type: 'boolean',
		describe: 'Handle query parameters in request path'
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
const app = jserve({
	contentType: 'application/x-shunter+json',
	log: {
		debug: console.log.bind(console),
		error: console.error.bind(console),
		info: console.log.bind(console)
	},
	middleware: [
		interceptIndex,
		query(),
		handleQueryParameters,
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

// Middleware to serve JSON at the index route
// eg. a request to / will return data/index.json
function interceptIndex(request, response, next) {
	if (args.index === true && request.path === '/') {
		request.path = '/index.json';
	}
	return next();
}

// Middleware to handle query parameters in the request
// eg. a request to /search?q=hello&count=10 will return data/search/q_count.json
function handleQueryParameters(request, response, next) {
	if (args.query === true && Object.keys(request.query).length > 0) {
		request.path += '/' + Object.keys(request.query).join('_') + '.json';
	}
	return next();
}

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
	const options = {
		url: request.query.url,
		headers: request.query.headers
	};
	let error;

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
	const requestOptions = {
		url: options.url,
		headers: options.headers
	};
	let error;

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
	let headers = {};
	const headersArray = headerString.split(/[\r\n]+/);

	headersArray.forEach(function (headerString) {
		const headerChunks = headerString.split(':');
		headers[headerChunks.shift().trim()] = headerChunks.join(':').trim();
	});

	return headers;
}
