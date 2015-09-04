'use strict';

var sinon = require('sinon');

module.exports = sinon.stub().returns({
	send: sinon.stub(),
	error: sinon.stub()
});
