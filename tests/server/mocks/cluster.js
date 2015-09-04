'use strict';

var sinon = require('sinon');

module.exports = {
	isMaster: true,
	fork: sinon.stub().returns({
		on: sinon.stub()
	}),
	workers: {},
	on: sinon.stub()
};
