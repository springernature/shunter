'use strict';

var sinon = require('sinon');

module.exports = {
	render: sinon.stub(),
	compile: sinon.stub(),
	loadSource: sinon.stub(),
	makeBase: sinon.stub().returns({
		push: sinon.stub().returnsArg(0)
	}),
	cache: {}
};
