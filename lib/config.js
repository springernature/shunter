
'use strict';

module.exports = function(env, config, args) {
	// jshint maxcomplexity: 9

	config = config || {};

	env = env || process.env.NODE_ENV || 'development';

	var hostname = require('os').hostname();
	var path = require('path');
	var yargs = require('yargs');
	var extend = require('extend');
	var fs = require('fs');
	var winston = require('winston');
	var shunterRoot = path.dirname(__dirname);

	args = args || yargs
		.options('p', {
			alias: 'port',
			default: 5400,
			type: 'number'
		})
		.options('m', {
			alias: 'max-post-size',
			default: 204800,
			type: 'number'
		})
		.options('c', {
			alias: 'max-child-processes',
			default: 10,
			type: 'number'
		})
		.options('r', {
			alias: 'route-config',
			default: 'default'
		})
		.options('s', {
			alias: 'syslog',
			type: 'boolean'
		})
		.options('d', {
			alias: 'source-directory',
			default: process.cwd(),
			type: 'string'
		})
		.options('o', {
			alias: 'route-override',
			type: 'string'
		})
		.options('g', {
			alias: 'origin-override',
			type: 'boolean'
		})
		.options('rewrite-redirect', {
			type: 'boolean'
		})
		.options('rewrite-protocol', {
			type: 'string'
		})
		.options('compile-on-demand', {
			type: 'boolean'
		})
		.describe({
			p: 'Port number',
			m: 'Maximum size for request body in bytes',
			c: 'Shunter will create one worker process per cpu available up to this maximum',
			r: 'Specify the name of the default route from your route config file',
			s: 'Enable logging to syslog',
			o: 'Specify host and port to override or replace route config file',
			g: 'Requires --route-override. Sets changeOrigin to true for the route set up via --route-override',
			d: 'Specify the directory for the main app if you are not running it from its own directory',
			'rewrite-redirect': 'Rewrite the location host/port on 301, 302, 307 & 308 redirects based on requested host/port',
			'rewrite-protocol': 'Rewrite the location protocol on 301, 302, 307 & 308 redirects to http or https',
			'compile-on-demand': 'Compile templates on demand instead of at application start up, only recommended in development mode'
		})
		.alias('h', 'help')
		.help()
		.alias('v', 'version')
		.version(function() {
			return require('../package').version;
		})
		.check(function(argv, args) {
			var exclude = ['_', '$0'];

			Object.keys(argv).forEach(function(key) {
				if (exclude.indexOf(key) === -1 && !args.hasOwnProperty(key)) {
					throw new Error('Unknown argument error: `' + key + '` is not a valid argument');
				}
			});
			Object.keys(args).forEach(function(key) {
				if (Array.isArray(argv[key])) {
					throw new Error('Invalid argument error: `' + key + '` must only be specified once');
				}
			});
			return true;
		})
		.argv;

	var appRoot = args['source-directory'] || process.cwd();

	var defaultConfig = {
		argv: args,
		middleware: [],
		modules: [],
		path: {
			root: appRoot,
			shunterRoot: shunterRoot,
			themes: path.join(shunterRoot, 'themes'),
			templates: path.join(appRoot, 'view'),
			public: path.join(appRoot, 'public'),
			publicResources: path.join(appRoot, 'public', 'resources'),
			resources: path.join(appRoot, 'resources'),
			shunterResources: path.join(shunterRoot, 'resources'),
			tests: path.join(appRoot, 'tests'),
			clientTests: path.join(appRoot, 'tests', 'client'),
			dust: path.join(appRoot, 'dust')
		},
		web: {
			public: '/public',
			publicResources: '/public/resources',
			resources: '/resources',
			tests: '/tests'
		},
		structure: {
			templates: 'view',
			templateExt: '.dust',
			resources: 'resources',
			styles: 'css',
			images: 'img',
			scripts: 'js',
			fonts: 'fonts',
			tests: 'tests',
			filters: 'filters',
			filtersInput: 'input',
			filtersOutput: 'output',
			dust: 'dust',
			ejs: 'ejs',
			mincer: 'mincer'
		},
		log: new winston.Logger({
			transports: [
				new (winston.transports.Console)({
					colorize: true,
					timestamp: true
				})
			]
		}),
		statsd: {
			host: 'localhost',
			prefix: 'shunter.',
			mock: env === 'development'
		},
		timer: function() {
			var start = Date.now();
			return function(msg) {
				var diff = Date.now() - start;
				config.log.info(msg + ' - ' + diff + 'ms');
				return diff;
			};
		},
		env: {
			name: env,
			host: function() {
				return hostname;
			},
			isDevelopment: function() {
				return this.name === 'development';
			},
			isProduction: function() {
				return this.name === 'production';
			}
		},
		jsonViewParameter: null
	};
	config = extend(true, {}, defaultConfig, config);
	var localConfig = path.join(appRoot, 'config', 'local.json');
	if (fs.existsSync(localConfig)) {
		extend(true, config, require(localConfig));
	}
	if (config.argv.syslog && config.syslogAppName) {
		// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
		require('winston-syslog');
		config.log.add(winston.transports.Syslog, {
			localhost: hostname,
			app_name: config.syslogAppName
		});
	}
	return config;
};
