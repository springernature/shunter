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

module.exports = function (config) {
	const renderer = require('./renderer')(config);

	const renderPageForContext = function (req, res, templateContext, fn) {
		renderer.render(req, res, templateContext, function (err, out) {
			if (err || !out) {
				config.log.warn('Rendering custom error page failed (misconfiguration?)');
				fn(null);
			} else {
				fn(out);
			}
		});
	};

	const getTemplateContext = function (err, req, fn) {
		if (!err) {
			fn(null);
			return;
		}

		// Some internal errors will throw with no status set
		if (!err.status) {
			err.status = 500;
		}

		const key = typeof err.status === 'string' ? err.status : err.status.toString();
		const userData = config.errorPages;
		const layout = userData.errorLayouts.hasOwnProperty(key) ? userData.errorLayouts[key] : userData.errorLayouts.default;

		const templateContext = {
			layout: {
				template: layout,
				namespace: 'custom-errors'
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
			for (let key in userData.staticData) {
				// Prevent the user clobbering required templateContext keys & proto
				if (userData.staticData.hasOwnProperty(key) && !(key in templateContext)) {
					templateContext[key] = userData.staticData[key];
				}
			}
		}

		return templateContext;
	};

	return {
		getPage: function (err, req, res, fn) {
			if (!config.errorPages || !config.errorPages.errorLayouts || !config.errorPages.errorLayouts.default) {
				fn(null);
			} else {
				renderPageForContext(req, res, getTemplateContext(err, req, fn), fn);
			}
		}
	};
};
