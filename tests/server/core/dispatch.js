'use strict';

var assert = require('proclaim');
var sinon = require('sinon');
var mockery = require('mockery');

var moduleName = '../../../lib/dispatch';

describe('Dispatching response', function() {
	var config;
	var contentType;
	var createFilter;
	var filter;
	var req;
	var res;

	beforeEach(function() {
		mockery.enable({
			useCleanCache: true,
			warnOnUnregistered: false,
			warnOnReplace: false
		});

		contentType = sinon.stub().returns('text/html; charset=utf-8');

		filter = sinon.stub().returnsArg(0);
		createFilter = sinon.stub().returns(filter);


		mockery.registerMock('./output-filter', createFilter);
		req = require('../mocks/request');
		req.url = '/hello';
		mockery.registerMock('./content-type', contentType);
		res = require('../mocks/response');
		config = {
			argv: {},
			log: require('../mocks/log'),
			timer: sinon.stub().returns(sinon.stub()),
			env: {
				isDevelopment: sinon.stub().returns(false),
				isProduction: sinon.stub().returns(true),
				tier: sinon.stub().returns('ci'),
				host: sinon.stub().returns('ci')
			}
		};
	});
	afterEach(function() {
		mockery.deregisterAll();
		mockery.disable();
	});

	it('Should set the content type header', function() {
		var dispatch = require(moduleName)(config);

		dispatch.send(null, 'hello', req, res);
		assert.isTrue(res.setHeader.calledWith('Content-type', 'text/html; charset=utf-8'));
	});

	it('Should set the correct content type if the json parameter is set', function() {
		var dispatch = require(moduleName)(config);
		req.isJson = true;

		dispatch.send(null, '{"foo": "bar"}', req, res, 200);
		assert.isTrue(res.setHeader.calledWith('Content-type', 'application/json; charset=utf-8'));
		assert.isTrue(res.writeHead.calledOnce);
		assert.isTrue(res.writeHead.calledWith(200));
		assert.isTrue(res.end.calledOnce);
	});

	it('Should take multibyte characaters into account when setting the content length header', function() {
		var dispatch = require(moduleName)(config);

		dispatch.send(null, 'hello¡', req, res);
		assert.isTrue(res.setHeader.calledWith('Content-length', 7));
	});

	it('Should default to a 200 status if there was no error', function() {
		var dispatch = require(moduleName)(config);

		dispatch.send(null, 'hello', req, res);
		assert.isTrue(res.writeHead.calledOnce);
		assert.isTrue(res.writeHead.calledWith(200));
		assert.isTrue(res.end.calledOnce);
	});

	it('Should allow the status code to be passed to it', function() {
		var dispatch = require(moduleName)(config);

		dispatch.send(null, 'not allowed', req, res, 401);
		assert.isTrue(res.writeHead.calledOnce);
		assert.isTrue(res.writeHead.calledWith(401));
		assert.isTrue(res.end.calledOnce);
	});

	it('Should set a 500 status if there was an error', function() {
		var dispatch = require(moduleName)(config);

		dispatch.send({message: 'fail'}, 'hello', req, res, 200);
		assert.isTrue(res.writeHead.calledOnce);
		assert.isTrue(res.writeHead.calledWith(500));
		assert.isTrue(res.end.calledOnce);
	});
});
