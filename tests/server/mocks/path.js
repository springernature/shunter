'use strict';

var sinon = require('sinon');

module.exports = {
	join: sinon.stub(),
	basename: function(str) {
		var lastSlash = str.lastIndexOf('/');
		var val = str.substring(lastSlash + 1);
		val = val.replace('.dust', '');
		return val;
	},
	dirname: sinon.stub(),
	extname: sinon.stub(),
	relative: sinon.stub(),
	sep: '/'
};
