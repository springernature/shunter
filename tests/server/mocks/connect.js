'use strict';

var sinon = require('sinon');

var connect = sinon.stub().returns({
	use: sinon.stub(),
	listen: sinon.stub()
});
connect.utils = {
	error: sinon.stub().returns({})
};

module.exports = connect;
