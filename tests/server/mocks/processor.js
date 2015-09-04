'use strict';

var sinon = require('sinon');

module.exports = sinon.stub().returns({
	timestamp: sinon.stub(),
	intercept: sinon.stub(),
	proxy: sinon.stub(),
	ping: sinon.stub(),
	api: sinon.stub()
});
