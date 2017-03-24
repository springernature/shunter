'use strict';

var sinon = require('sinon');

module.exports = {
	createProxyServer: sinon.stub().returns({
		web: sinon.stub(),
		on: sinon.stub()
	})
};
