'use strict';

var sinon = require('sinon');

module.exports = {
	debug: sinon.spy(),
	info: sinon.spy(),
	warn: sinon.spy(),
	error: sinon.spy()
};
