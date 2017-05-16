'use strict';

var sinon = require('sinon');

module.exports = sinon.stub().returns({
	getLogger: sinon.stub()
});
