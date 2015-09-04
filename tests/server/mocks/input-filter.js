'use strict';

var sinon = require('sinon');

module.exports = sinon.stub().returns({
	add: sinon.stub(),
	run: sinon.stub()
});
