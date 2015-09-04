
'use strict';

var assert = require('proclaim');
var helper = require('../../helpers/template.js')();

describe('Dust Filter: lower', function() {
	it('Should be able to convert a string to lower case', function(done) {
		helper.render('{test|lower}', {
			test: 'Hello World'
		}, function(err, dom, str) {
			assert.strictEqual(str, 'hello world');
			done();
		});
	});
});
