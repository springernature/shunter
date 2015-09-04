'use strict';

var sinon = require('sinon');

module.exports = {
	cpus: sinon.stub().returns([]),
	release: sinon.stub(),
	hostname: sinon.stub().returns('test-shunter.nature.com')
};
