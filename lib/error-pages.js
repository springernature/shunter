'use strict';

/*
	Sample client config;
	{
		"errorLayouts": {
			"default": "layout",
			"404": "layout-error-404"
		},
		"staticData": {
			...whatever data you require to render your page...
*/

module.exports = function(config) {
	var renderer = require('./renderer')(config);

	var renderPageForContext = function(req, res, templateContext, fn) {
		renderer.render(req, res, templateContext, function(err, out) {
			if (err || !out) {
				config.log.warn('Rendering custom error page failed (misconfiguration?)');
				fn(undefined);
			} else {
				fn(out);
			}
		});
	};

	var getTemplateContext = function(err, req) {
		var key = typeof err.status === 'string' ? err.status : err.status.toString();
		var userData = config.errorPages;
		var layout = userData.errorLayouts.hasOwnProperty(key) ? userData.errorLayouts[key] : userData.errorLayouts.default;

		var templateContext = {
			layout: {
				template: layout,
				namespace: 'custom-errors' // TODO: the dust namespace - can we just put anything here?
			},
			errorContext: {
				error: err,
				hostname: config.env.host(),
				isDevelopment: config.env.isDevelopment(),
				isProduction: config.env.isProduction(),
				reqHost: req.headers.host,
				reqUrl: req.url
			}
		};

		if (userData.staticData) {
			for (var key in userData.staticData) {
				if (!userData.staticData.hasOwnProperty(key)) {
					continue;
				}

				templateContext[key] = userData.staticData[key];
			}
		}

		return templateContext;
	};

	return {
		getPage: function(err, out, req, res, fn) {
			if (!config.errorPages || !config.errorPages.errorLayouts || !config.errorPages.errorLayouts.default) {
				fn(undefined);
			} else {
				renderPageForContext(req, res, getTemplateContext(err, req), fn);
			}
		}
	};

};
