'use strict';

var sinon = require('sinon');

module.exports = sinon.stub().returns({
	watchTree: sinon.stub().returns({
		on: sinon.stub()
	})
});
