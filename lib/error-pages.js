'use strict';

/*
	Sample client config;
	{
		"interceptBackendErrors": true,
		"errorLayouts": {
			"default": "layout",
			"404": "layout-error-404"
		},
		"staticData": {
			...whatever data you require to render your page...
*/

module.exports = function(config) {

	var renderer = require('./renderer')(config);

	/*
		getPage returns;
		- undefined on any error preventing rendering of the custom error page
			(thereby falling-back to Shunter's hardcoded 50x page in dispatch.error()),
			or custom error pages not being configured.
		- or the HTML of the templatised custom error page.
	*/
	var api = {
		getPage: function(err, out, req, res) {
			if (!config.errorPages || !config.errorPages.errorLayouts || !config.errorPages.errorLayouts.default) {
				return undefined;
			}

			return renderPageForContext(req, res, getTemplateContext(err));
		}
	};

	var renderPageForContext = function(req, res, templateContext) {
		var returnValue;
		renderer.render(req, res, templateContext, function(err, out) {
			if (err || !out) {
				// Avoid "Additionally, a 404 Not Found error was encountered while trying to use an ErrorDocument to handle the request." :)
				config.log.warn('Something went wrong with template rendering (missing template?)');
				returnValue = undefined;
			}

			returnValue = out;
		});

		return returnValue;
	};

	var getTemplateContext = function(err) {
		var key = typeof err.status === 'string' ? err.status : err.status.toString();
		var userData = config.errorPages;
		var layout = userData.errorLayouts.hasOwnProperty(key) ? userData.errorLayouts[key] : userData.errorLayouts.default;
		var templateContext = {
			layout: {
				template: layout,
				namespace: 'custom-errors' // TODO: the dust namespace - can we just put anything here?
			},
			error: err
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


	return api;
};
