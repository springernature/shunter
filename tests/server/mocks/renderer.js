'use strict';

var sinon = require('sinon');

module.exports = sinon.stub().returns({
	initDustExtensions: sinon.stub(),
	compileTemplates: sinon.stub(),
	watchTemplates: sinon.stub(),
	watchDustExtensions: sinon.stub(),
	assetServer: sinon.stub(),
	render: sinon.stub(),
	renderPartial: sinon.stub()
});
