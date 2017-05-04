
'use strict';

var assert = require('proclaim');
var helper = require('../../helpers/template.js')();

describe('Dust Filter: upper', function () {
	it('Should be able to convert a string to upper case', function (done) {
		helper.render('{test|upper}', {
			test: 'Hello World'
		}, function (err, dom, str) {
			assert.strictEqual(str, 'HELLO WORLD');
			done();
		});
	});
});
