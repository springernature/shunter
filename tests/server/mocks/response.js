'use strict';

var sinon = require('sinon');

module.exports = {
	writeHead: sinon.stub(),
	write: sinon.stub(),
	getHeader: sinon.stub(),
	setHeader: sinon.stub(),
	end: sinon.stub()
};
