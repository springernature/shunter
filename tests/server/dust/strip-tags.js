
'use strict';

var assert = require('proclaim');
var helper = require('../../helpers/template.js')();

describe('Dust Filter: stripTags', function () {
	it('Should be able to strip html from a string', function (done) {
		helper.render('{test|stripTags}', {
			test: '<p>Hello <a href="#">world</a></p>'
		}, function (err, dom, str) {
			assert.strictEqual(str, 'Hello world');
			done();
		});
	});
});
