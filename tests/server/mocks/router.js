'use strict';

var sinon = require('sinon');

module.exports = sinon.stub().returns({
	map: sinon.stub().returns({
		host: '127.0.0.1',
		port: 5401
	})
});
