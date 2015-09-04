'use strict';

var sinon = require('sinon');

module.exports = {
	createServer: sinon.stub(),

	logger: {
		use: sinon.stub()
	},

	Environment: function() {
		this.findAsset = sinon.stub();
		this.registerHelper = sinon.stub();
		this.appendPath = sinon.stub();
		this.prependPath = sinon.stub();
	},
	Manifest: function() {
		this.assets = {
			'test.css': 'test-prod-md5.css'
		};
	}
};
