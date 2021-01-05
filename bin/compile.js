#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const async = require('async');
const glob = require('glob');
const mkdirp = require('mkdirp');
const uglify = require('uglify-js');
const yargs = require('yargs');

const argv = yargs
	.options('x', {
		alias: 'extra-js',
		type: 'string'
	})
	.options('r', {
		alias: 'resource-module',
		type: 'string'
	})
	.alias('h', 'help')
	.help()
	.describe({
		x: 'Extra JS paths to minify',
		r: 'Name of modules with resources to include in the build, can specify several of these flags'
	})
	.argv;

const config = require('../lib/config')('production', null, {});

// All files named main.js will be minified, extra files to minify can be specified here
let EXTRA_MINIFY_PATHS = [];
if (argv['extra-js']) {
	EXTRA_MINIFY_PATHS = Array.isArray(argv['extra-js']) ? argv['extra-js'] : [argv['extra-js']];
}

let resourceModules;
if (argv['resource-module']) {
	resourceModules = (
		Array.isArray(argv['resource-module']) ?
			argv['resource-module'] :
			[argv['resource-module']]
	);
	config.modules = resourceModules;
}

const renderer = require('../lib/renderer')(config);

const environment = renderer.environment;
const manifest = renderer.manifest;

environment.cssCompressor = 'csswring';

// Crude listener for errors, replace with domain once that is stable
process.on('uncaughtException', function (err) {
	console.error('Caught exception: ' + err);
	process.exit(128);
});

const compile = function (data, callback) {
	const findAssets = function () {
		const pattern = new RegExp('\.(' + [].slice.call(arguments, 0).join('|') + ')$');
		return Object.keys(data.assets).filter(function (key) {
			return key.match(pattern);
		});
	};

	const deleteAsset = function (name) {
		delete manifest.assets[name];
		return null;
	};

	const stylesheets = findAssets('css').map(function (name) {
		const asset = environment.findAsset(name);
		const content = asset ? asset.toString() : null;

		if (!content) {
			return deleteAsset(name);
		}

		return {
			path: config.path.publicResources + '/' + data.assets[name],
			content: content
		};
	}).filter(function (stylesheet) {
		return stylesheet !== null;
	});

	const jsToMinify = ['main'].concat(EXTRA_MINIFY_PATHS);

	const javascripts = findAssets('js').filter(function (name) {
		for (let i = 0; jsToMinify[i]; ++i) {
			if (name.indexOf(jsToMinify[i]) !== -1) {
				return true;
			}
		}
		return false;
	}).map(function (name) {
		const asset = environment.findAsset(name);
		let content = asset ? asset.toString() : null;
		let start;
		let end;

		if (!content) {
			return deleteAsset(name);
		}
		start = new Date();
		content = uglify.minify(content, {
			fromString: true
		}).code;
		end = new Date();
		// Note: suspect this part of the process is timing out on build, extra logging to test
		console.log('Uglifying ' + name + ' took ' + (end - start) + 'ms');

		return {
			path: config.path.publicResources + '/' + data.assets[name],
			content: content
		};
	}).filter(function (script) {
		return script !== null;
	});
	// Save the updated stylesheets and javascripts, then save the manifest
	async.map(stylesheets.concat(javascripts), function (resource, fn) {
		console.log('Writing resource to ' + resource.path);
		fs.writeFile(resource.path, resource.content, 'utf8', fn);
	}, function () {
		manifest.save(callback);
	});
};

const generate = function (callback) {
	async.waterfall([
		function (fn) {
			mkdirp(config.path.publicResources, fn);
		},
		function (dir, fn) {
			// Glob returns absolute path and we need to strip that out
			const readGlobDir = function (p, cb) {
				const pth = p.replace(/\\\?/g, '\/'); // Glob must use / as path separator even on windows
				glob(pth + '/**/*.*', function (er, files) {
					if (er) {
						return cb(er);
					}
					return cb(null, files.map(function (f) {
						return path.relative(p, f);
					}));
				});
			};
			// Returns a flat array of files with relative paths
			async.concat(environment.paths, readGlobDir, fn);
		},
		function (files) {
			let data = null;
			try {
				data = manifest.compile(files.filter(function (file) {
					return /(?:\.([^.]+))?$/.exec(file) === 'scss';
				}));
			} catch (err) {
				callback(err, null);
			}
			if (data) {
				compile(data, callback);
			}
		},
		function (files) {
			let data = null;
			try {
				data = manifest.compile(files.map(function (file) {
					return file.replace(/\.ejs$/, '');
				}));
			} catch (err) {
				callback(err, null);
			}
			if (data) {
				compile(data, callback);
			}
		}
	]);
};

generate(function (err) {
	if (err) {
		console.error('Failed to generate manifest: ' + (err.message || err.toString()));
		process.exit(128);
	} else {
		console.log('Manifest compiled');
		process.exit(0);
	}
});
