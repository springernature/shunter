'use strict';

var sinon = require('sinon');

module.exports = {
	headers: {
		host: 'the.request.host'
	},
	removeAllListeners: sinon.stub(),
	emit: sinon.stub()
};
