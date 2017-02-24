
'use strict';

module.exports = function(config) {

	var renderer = require('./renderer')(config);
	var messages = {
		TEMPLATE_NOT_FOUND: 'Template not found'
	}
	/*
		returns;
		- undefined on any error preventing rendering of the custom error page
			(thereby falling-back to Shunter's hardcoded 50x page in dispatch.error()),
			or custom error pages not being configured.
		- or the HTML of the templatised custom error page.
	*/
	var getPage = function(err, out, req, res, status) {
		// TODO be defensive about status type
		// be nice to fix err.status if ! err.status
		if (! config.errorPages || ! config.errorPages.layouts || ! config.errorPages.layouts.defaultLayout) {
			config.log.warn('NO FANCY ERRORS');
			return undefined;
		}

		config.log.warn('FANCY ERRORS');
		return renderPageForContext(req, res, getTemplateContext(err));
	};

// TODO is interceptBackendErrors used?

	var renderPageForContext = function(req, res, templateContext) {
		var returnValue;
		renderer.render(req, res, templateContext, function(err, out) {
			if (err === messages.TEMPLATE_NOT_FOUND) {
				config.log.warn('error handling template not found');
				out = '';
			}

			if (! out || out === '') {
				/* CASE 1: error handling template not found */
				// "Additionally, a 404 Not Found error was encountered while trying to use an ErrorDocument to handle the request." :)
				config.log.warn('renderPageForContext: something went wrong with template rendering');
				returnValue = undefined;
			}

			/* CASE 2: rendered ok */
			returnValue = out;
		});

		return returnValue;
	}


	var getTemplateContext = function(err) {
		var key = typeof err.status === 'string' ? err.status : err.status.toString();
		var layout = config.errorPages.layouts.hasOwnProperty(key) ? config.errorPages.layouts[key] : config.errorPages.layouts.defaultLayout;
		var templateContext = {
			'layout': {
				'template' : layout,
				'namespace' : 'frontend-springer-transfer'
			},
			'error': err
		};

		if (config.errorPages.staticData) {
			Object.assign(templateContext, config.errorPages.staticData);
		};

		return templateContext;
	}

	// API
	return {
		getPage: getPage
	}
}

