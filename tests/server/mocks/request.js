'use strict';

var sinon = require('sinon');

module.exports = {
	headers: {},
	removeAllListeners: sinon.stub(),
	emit: sinon.stub()
};
