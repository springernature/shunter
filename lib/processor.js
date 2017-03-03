
'use strict';

// middlewares
module.exports = function(config, renderer) {
	var pkg = require('../package.json');
	var httpProxy = require('http-proxy');
	var rewriteRedirect = config.argv['rewrite-redirect'] || false;
	var protocolRewrite = config.argv['rewrite-protocol'] || null;
	var proxy = httpProxy.createProxyServer({
		autoRewrite: rewriteRedirect,
		protocolRewrite: protocolRewrite
	});
	var deployTimestamp = require('../timestamp').value;
	var dispatch = require('./dispatch')(config);
	var statsd = require('./statsd')(config);
	var router = require('./router')(config);

	var proxyErr = false;
	proxy.on('proxyRes', function (proxyRes, req, res) {
//		console.log('--- proxy.on("proxyRes" ');//: raw Response from the target', JSON.stringify(proxyRes.headers, true, 2));
//		console.log(proxyRes.statusCode);
//		console.log(proxyRes.statusMessage);
		if (proxyRes.statusCode >= 400) {
			proxyErr = new Error(proxyRes.statusMessage);
			proxyErr.status = proxyRes.statusCode;
		} else {
			proxyErr = false;
		}

	});

	var parseJson = function(data) {
		var json = null;
		var err = null;

		try {
			json = JSON.parse(data);
		} catch (e) {
			err = e;
		}

		return {
			error: err,
			data: json
		};
	};

	var processor = {
		timestamp: function(req, res, next) {
			req.headers['X-Shunter-Deploy-Timestamp'] = deployTimestamp;
			next();
		},

		shunterVersion: function(req, res, next) {
			req.headers['X-Shunter'] = pkg.version;
			next();
		},

		intercept: function(req, res, next) {
			// jscs:disable disallowDanglingUnderscores
			var data = [];
			var status = null;

			var shouldIntercept = function() {
				var type = res.getHeader('Content-type');
				var method = req.method ? req.method.toUpperCase() : 'GET';
				var acceptedType = type && (type.indexOf('x-shunter+json') !== -1);
				var acceptedMethod = method === 'GET' || method === 'POST';

				return acceptedType && acceptedMethod;
			};

			var writeHead = function(code) {
				statsd.increment('total_requests');

				if (shouldIntercept()) {
					res.write = write;
					res.end = endIntercept;
					status = code;
					if (req.__proxyTimingFunctionHeadersReceived) {
						statsd.classifiedTiming(req.url, 'proxy_headers_received', req.__proxyTimingFunctionHeadersReceived('Received headers ' + req.url));
					}
				} else if (proxyErr) {
					// TODO: do we care about statsd here?
					res.write = write;
					res.end = endProxyError;
					status = code;
				} else {
					res.__originalWriteHead.apply(res, [].slice.call(arguments, 0));
				}
			};

			var write = function(chunk) {
				data.push(chunk);
			};

			var endProxyError = function() {
				res.writeHead = res.__originalWriteHead;
				res.write = res.__originalWrite;
				res.end = res.__originalEnd;
				return dispatch.send(proxyErr, '', req, res);
			};

			var endIntercept = function() {
				var timer = config.timer();

				if (req.__proxyTimingFunctionBodyReceived) {
					statsd.classifiedTiming(req.url, 'proxy_body_received', req.__proxyTimingFunctionBodyReceived('Received body ' + req.url));
				}
				var rawJson = Buffer.concat(data).toString('utf8');
				var json = parseJson(rawJson);

				statsd.classifiedGauge(req.url, 'json_size', Buffer.byteLength(rawJson));
				statsd.classifiedTiming(req.url, 'parsing', timer('Parsing JSON ' + req.url));

				res.writeHead = res.__originalWriteHead;
				res.write = res.__originalWrite;
				res.end = res.__originalEnd;

				if (!json.error) {
					if (config.jsonViewParameter && req.query[config.jsonViewParameter]) {
						req.isJson = true;
						var jsonOutput = JSON.stringify(json.data, null, '\t');
						return dispatch.send(null, jsonOutput, req, res, status);
					}

					var timer = config.timer();
					renderer.render(req, res, json.data, function(err, out) {
						statsd.classifiedTiming(req.url, 'rendering', timer('Rendering ' + req.url));
						dispatch.send(err, out, req, res, status);
					});
				} else {
					dispatch.send(json.error, '', req, res);
				}
			};

			res.__originalWriteHead = res.writeHead;
			res.__originalEnd = res.end;
			res.__originalWrite = res.write;

			res.writeHead = writeHead;

			next();
			// jscs:enable disallowDanglingUnderscores
		},

		ping: function(req, res) {
			res.writeHead(200);
			res.end('pong');
		},

		api: function(req, res) {
			var name = req.url.replace(/^\/+/, '').replace(/\?.*/, '').replace(/\/+/g, '__');
			var body = req.body;
			var err = null;

			if (!name && body.layout && body.layout.template) {
				name = body.layout.template;
			}

			if (name) {
				renderer.renderPartial(name, req, res, body, function(err, out) {
					dispatch.send(err, out, req, res);
				});
			} else {
				err = new Error('Template not found');
				err.status = 404;
				dispatch.send(err, null, req, res);
			}
		},

		proxy: function(req, res) {
			// jscs:disable disallowDanglingUnderscores
			req.headers = req.headers || {};

			var host = req.headers.host || '';
			var route = router.map(host, req.url);
			var err = null;

			var rewriteRequestHeaders = function() {
				if (route.changeOrigin) {
					req.headers['X-Orig-Host'] = host;
				}
			};

			if (!route) {
				err = new Error('Request did not match any route');
				err.status = 404;
				dispatch.send(err, null, req, res);
			} else if (!route.host) {
				err = new Error('Route does not define a host');
				err.status = 500;
				dispatch.send(err, null, req, res);
			} else {
				route.target = 'http://' + route.host + (route.port ? ':' + route.port : '');

				config.log.info('Proxying request for ' + host + req.url + ' to ' + route.target + req.url);
				req.__proxyTimingFunctionHeadersReceived = config.timer();
				req.__proxyTimingFunctionBodyReceived = config.timer();

				rewriteRequestHeaders();
				proxy.web(req, res, route, function(err) {
					err.status = (err.code === 'ECONNREFUSED') ? 502 : 500;
					dispatch.send(err, null, req, res);
				});
			}
			// jscs:enable disallowDanglingUnderscores
		}
	};

	return processor;
};
