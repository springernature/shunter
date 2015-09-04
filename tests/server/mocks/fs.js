'use strict';

var sinon = require('sinon');

module.exports = {
	mockStatReturn: {
		isDirectory: sinon.stub()
	},
	writeFile: sinon.stub(),
	writeFileSync: sinon.stub(),
	readFileSync: sinon.stub(),
	unlinkSync: sinon.stub(),
	readdirSync: sinon.stub(),
	statSync: sinon.stub(),
	existsSync: sinon.stub()
};

module.exports.statSync.returns(module.exports.mockStatReturn);
