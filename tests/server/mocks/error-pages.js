'use strict';

var sinon = require('sinon');

module.exports = sinon.stub().returns({
	getPage: sinon.stub()
});
