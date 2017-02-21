
'use strict';

module.exports = function(config) {

	var renderer = require('./renderer')(config);

	var codes = {
		TEMPLATE_NOT_FOUND: 'Template not found'
	};

	config.middleware.push([function(err, req, res, next) {
		config.log.warn('~~~ ERROR ~~~');
		config.log.warn(err);
		config.log.warn(res);

		if (! err) {
			next();
			return;
		}


		next();
	}]);


	/* If the backed returns a response it should get caught here */
	config.middleware.push([function(req, res, next) {
		var dispatch = require('./dispatch')(config);
		res.end = function() {
			config.log.warn('~~~ SUCCESS MIDDLEWARE ~~~');
			config.log.warn(res.statusCode);
			config.log.warn(res.statusMessage);
			config.log.warn(res.headers);

			var err;
			if (res.statusCode >= 400) { // TODO: check me
				err = new Error(res.statusMessage);
				err.status = res.statusCode;
				config.log.warn('... dispatching ...');
				if (! res.headersSent) {
					dispatch.send(err, '', req, res);
				} else {
					config.log.warn('... cant, headers sent ...');
				}
			}
		}

		next();
	}]);


	var getTemplateContext = function(err) {
		var key = typeof err.status === 'string' ? err.status : err.status.toString();
		var layout = config.errorPages.layouts.hasOwnProperty(key) ? config.errorPages.layouts[key] : config.errorPages.layouts.defaultLayout;
		var templateContext = {
			'layout': {
				'template' : layout
			},
			'error': err
		};

		if (config.errorPages.staticData) {
			Object.assign(templateContext, config.errorPages.staticData);
		};

		return templateContext;
	}


	var getRenderedPage = function(req, res, templateContext){
		// "Closures... an extremely powerful property of the language." Crockford
		// "Self-immolation... an extremely powerful property of petrol." jpw
		var returnValue;
		renderer.render(req, res, templateContext, function(err, out) {
			if (err === codes.TEMPLATE_NOT_FOUND) {
				out = '';
			}

			if (! out || out === '') {
				/* CASE 1: error handling template not found */
				// "Additionally, a 404 Not Found error was encountered while trying to use an ErrorDocument to handle the request." :)
				config.log.warn('error handling template not found');
				returnValue = undefined;
			}

			/* CASE 2: rendered ok */
			returnValue = out;
		});

		return returnValue;
	}



	return {
		codes: codes,
		/*
			returns;
			- undefined on any error preventing rendering of the custom error page
				(thereby falling-back to Shunter's hardcoded 50x page in dispatch.error())
			- or the HTML of the templatised custom error page
		*/
		errorRouter: function(err, out, req, res, status) {
			debugger;
			// TODO be defensive about status type
			// be nice to fix err.status if ! err.status
			if (! config.errorPages || ! config.errorPages.layouts || ! config.errorPages.layouts.defaultLayout) {
				config.log.warn('NO FANCY ERRORS');
				return undefined;
			}

			config.log.warn('FANCY ERRORS');
			return getRenderedPage(req, res, getTemplateContext(err));
		}
	}
}

