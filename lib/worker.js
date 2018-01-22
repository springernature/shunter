
'use strict';

module.exports = function (config) {
	var connect = require('connect');
	var bodyParser = require('body-parser');
	var cookieParser = require('cookie-parser');
	var serveStatic = require('serve-static');
	var query = require('qs-middleware');
	var app = connect();

	var benchmark = require('./benchmark')(config);
	var renderer = require('./renderer')(config);
	var processor = require('./processor')(config, renderer);

	renderer.initDustExtensions();
	if (!config.argv['compile-on-demand']) {
		renderer.compileTemplates();
	}

	if (config.env.isDevelopment()) {
		renderer.watchTemplates();
		renderer.watchDustExtensions();
	}

	app.use(benchmark);
	app.use(query({
		allowDots: false
	}));
	app.use(cookieParser());
	app.use(config.web.tests, serveStatic(config.path.tests));

	if (config.env.isProduction()) {
		app.use(config.web.public, serveStatic(config.path.public, {
			maxAge: 1000 * 60 * 60 * 24 * 365
		}));
	} else {
		app.use(config.web.resources, renderer.assetServer());
	}

	config.middleware.forEach(function (args) {
		app.use.apply(app, args);
	});

	app.use('/ping', processor.ping);
	app.use('/template', bodyParser.json({limit: config.argv['max-post-size']}));
	app.use('/template', processor.api);

	app.use(processor.timestamp);
	app.use(processor.shunterVersion);
	app.use(config.argv['mount-path'] || '/', processor.intercept);
	app.use(config.argv['mount-path'] || '/', processor.proxy);

	app.listen(config.argv.port, function () {
		config.log.debug('Worker process ' + process.pid + ' started in ' + config.env.name + ' mode, listening on port ' + config.argv.port);
	});
	process.on('uncaughtException', function (err) {
		if (err.code === 'EADDRINUSE') {
			config.log.error('Worker process ' + process.pid + ' died, something is already listening on port ' + config.argv.port);
			// Exit with status 0, so server doesn't attempt to respawn
			process.exit(0);
		} else {
			config.log.error(err);
			process.exit(1);
		}
	});

	process.on('message', function (msg) {
		if (msg === 'force exit') {
			process.exit(0);
		}
	});
	process.on('disconnect', function () {
		process.exit(0);
	});
};
