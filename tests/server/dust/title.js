
'use strict';

var assert = require('proclaim');
var helper = require('../../helpers/template.js')();

describe('Dust Filter: title', function () {
	it('Should be able to convert a string to title case', function (done) {
		helper.render('{test|title}', {
			test: 'hello this is SOME @test text'
		}, function (err, dom, str) {
			assert.strictEqual(str, 'Hello This Is Some @Test Text');
			done();
		});
	});
});
