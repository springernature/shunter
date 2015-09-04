#!/usr/bin/env node
// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
'use strict';

var connect = require('connect');
var serveStatic = require('serve-static');
var glob = require('glob');
var http = require('http');
var yargs = require('yargs');
var path = require('path');
var query = require('../lib/query');
var parseUrl = require('url').parse;
var dust = require('dustjs-linkedin');
var fs = require('fs');
var extend = require('extend');

var args = parseCliArguments();
var app = createJsonServer('/public');
startJsonServer(app, args.port);

// Parse and return command-line arguments
// Also output help information if requested
function parseCliArguments() {
	var args = yargs
		.options('p', {
			alias: 'port',
			default: 5401,
			type: 'number',
			describe: 'Port number'
		})
		.options('l', {
			alias: 'latency',
			default: 0,
			type: 'number',
			describe: 'Add milliseconds of latency to the request'
		})
		.alias('h', 'help')
		.help('help')
		.argv;

	return args;
}

// Iterate through Javascript nested Object and update a value
function updateData(obj, is, value, action) {
	// jshint maxcomplexity: 8
	if (typeof is === 'string') {
		return updateData(obj, is.split('.'), value, action);
	} else if (is.length === 1 && value !== undefined) {
		if (action === 'replace') {
			return obj[is[0]];
		} else if (action === 'append') {
			obj[is[0]] = obj[is[0]] + value;
			return obj[is[0]];
		} else if (action === 'prepend') {
			obj[is[0]] = value + obj[is[0]];
			return obj[is[0]];
		}
		return obj;
	} else if (is.length === 0) {
		return obj;
	} else if (obj.hasOwnProperty(is[0])) {
		return updateData(obj[is[0]], is.slice(1), value, action);
	} else {
		return obj;
	}
}

// Create and configure the JSON server
function createJsonServer(publicDirectory) {
	var app = connect();
	app.use(query());
	app.use(publicDirectory, serveStatic(path.join('.', publicDirectory)));
	app.use(attachRequestPathName);
	app.use(serveJsonUrl);
	app.use(serveHomePage);
	app.use(serveJsonFile);
	app.use(serve404Page);
	app.use(serve500Page);
	return app;
}

// (middleware) Add the request pathname to the request
function attachRequestPathName(req, res, next) {
	req.pathname = parseUrl(req.url).pathname;
	console.log('Request url: %s', req.pathname);
	next();
}

// (middleware) Serve a JSON url
function serveJsonUrl(req, res, next) {
	// (optional) Pass a link to a json endpoint
	// Example:
	// data=http://json.example.com/
	var jsonPath = req.query.data;

	if (typeof jsonPath !== 'undefined') {
		var host = parseUrl(jsonPath).host;
		var path = parseUrl(jsonPath).pathname;
		var json = req.query.json; // (optional) amend data before processing
		var headers = req.query.headers; // (optional) add headers
		var port = req.query.port; // (optional) specify port

		loadJsonUrl(host, path, json, headers, port, function(data) {
			if (data) {
				if (data instanceof Error) {
					return next(data);
				}
				return respondWithJson(res, 200, data);
			} else {
				return next();
			}
		});
	} else {
		return next();
	}
}

// (middleware) Serve the JSON server home page
function serveHomePage(req, res, next) {
	if (req.pathname === '/') {
		return respondWithHTML(res, 200, {
			page_template: 'home',
			title: 'Hello shunter!',
			folders: groupJsonFiles(listJsonFiles())
		});
	}
	next();
}

// (middleware) Serve a JSON file
function serveJsonFile(req, res, next) {
	var jsonPath = path.join(getDirectoryName(), req.pathname);
	var data = loadJsonFile(jsonPath);
	if (data) {
		if (data instanceof Error) {
			return next(data);
		}
		return respondWithJson(res, 200, data);
	}
	return next();
}

// (middleware) Serve a 404 page
function serve404Page(req, res) {
	respondWithHTML(res, 404, {
		page_template: '404',
		title: '404, page not found!'
	});
}

// (middleware) Serve a 500 page
function serve500Page(err, req, res, next) {
	// jshint unused: false
	respondWithHTML(res, 500, {
		page_template: '500',
		title: '500, internal server error!',
		error: {
			name: err.name,
			message: err.message,
			stack: cleanErrorStack(err.stack)
		}
	});
}

// Send a HTML string
function respondWithHTML(res, status, data) {
	var layoutDust = fs.readFileSync(__dirname + '/../view/json-serve/layout.dust', 'utf8');
	var includeDust = fs.readFileSync(__dirname + '/../view/json-serve/' + data.page_template + '.dust', 'utf8');
	var dustData = {
		layout: {
			page_template: 'include'
		}
	};
	extend(dustData, data);
	dust.loadSource(dust.compile(layoutDust, 'layout'));
	dust.loadSource(dust.compile(includeDust, 'include'));
	dust.render('layout', dustData, function(err, out) {
		res.writeHead(200, {
			'Content-type': 'text/html'
		});
		return res.end(out);
	});
}

// Send a shunter JSON response
function respondWithJson(res, status, data) {
	res.writeHead(status, {
		'Content-type': 'application/x-shunter+json'
	});
	setTimeout(function() {
		return res.end(JSON.stringify(data));
	}, args.latency);
}

function getDirectoryName() {
	var dirname = process.cwd().replace(/\\\?/gi, '/'); // replace backslashes with forward slashes
	return dirname;
}

// Load JSON via a URL
function loadJsonUrl(host, path, json, headers, port, callback) {
	var options = {
		host: host,
		path: path
	};

	// (optional) Pass headers as a JS Object to http.get
	// Examples:
	// headers={"header":"value"}
	// headers={"header":{"key":"value"}}
	if (headers) {
		options.headers = {};
		var object = JSON.parse(headers);

		Object.keys(object).forEach(function(property) {
			var value = (typeof object[property] === 'object') ? JSON.stringify(object[property]) : object[property]; // allow value to be a JSON object
			options.headers[property] = value;
		});
	}

	// (optional) Pass a port number
	// Example:
	// port=5000
	if (port) {
		options.port = parseInt(port);
	}

	return http.get(options, function(response) {
		var body = '';
		response.on('data', function(d) {
			body += d;
		});
		response.on('end', function() {
			var parsed = JSON.parse(body);

			// Update JSON data, by passing an array of objects
			// Must specify a path to update, a value, and an action (replace,append,prepend)
			// Example:
			// json=[{"path":"foo.bar","value":"foo","action":"replace"},{"path":"baz.qux","value":"bar","action":"prepend"}]
			if (json) {
				var data = JSON.parse(json);

				for (var i = 0; i < data.length; i++) {
					var object = data[i];
					if (object.path && object.value && object.action) {
						updateData(parsed, object.path, object.value, object.action);
					}
				}
			}

			callback(parsed);
		});
	});
}

// Load a JSON file
function loadJsonFile(jsonPath) {
	try {
		jsonPath = require.resolve(jsonPath);
	} catch (err) {
		return undefined;
	}
	Object.keys(require.cache).forEach(function(modulePath) {
		if (modulePath.indexOf('node_modules') === -1) {
			delete require.cache[modulePath];
		}
	});
	try {
		return require(jsonPath);
	} catch (err) {
		return err;
	}
}

// Get a list of all available JSON files
function listJsonFiles() {
	var dirname = getDirectoryName();
	return glob.sync(dirname + '/**/data/**/*.{json,js}').map(function(file) {
		return path.relative(dirname, file).replace(/\.js(on)?$/, '');
	});
}

// Group JSON files for rendering
function groupJsonFiles(files) {
	var foldersMap = {};
	var folders = [];
	files = files.map(splitJsonFile).filter(filterOutFalsy).forEach(function(file) {
		if (!foldersMap[file.folder]) {
			foldersMap[file.folder] = {
				folder_label: labelize(file.folder),
				files: []
			};
			folders.push(foldersMap[file.folder]);
		}
		foldersMap[file.folder].files.push({
			file_label: labelize(file.label),
			file_url: file.url
		});
	});
	return folders;
}

// Split a JSON file path into the chunks we need to render
function splitJsonFile(file) {
	var match = file.match(/.*data\/(([^\/]+)\/)?(.+)$/);
	if (match) {
		return {
			url: '/' + file,
			folder: match[2] || 'Global',
			label: match[3]
		};
	}
}

// Filter out falsy values
function filterOutFalsy(val) {
	return Boolean(val);
}

// Format a string to be used as a label
function labelize(string) {
	return string.replace(/[\s\-_\.]+/g, ' ').replace(/\s*\/\s*/g, ' / ');
}

// Clean an error stack
function cleanErrorStack(stack) {
	return stack
		.replace(/^[^\n]+\n/m, '') // remove first line
		.replace(/(^|\n)[ \t]+/g, '$1'); // remove indentation
}

// Start a JSON server and listen on a given port
function startJsonServer(app, port) {
	http.createServer(app).listen(port, function() {
		console.log('JSON server listening on port %d', port);
	});
}
