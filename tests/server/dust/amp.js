
'use strict';

var assert = require('proclaim');
var helper = require('../../helpers/template.js')();

describe('Dust Filter: amp', function() {
	it('Should safely html-escape ampersands', function(done) {
		helper.render('{test1|s|amp} {test2|s|amp}', {
			test1: '<p>A & B</p>',
			test2: '<p>A &gt; & &#x8212; B &amp;</p>'
		}, function(err, dom, str) {
			assert.strictEqual(str, '<p>A &amp; B</p> <p>A &gt; &amp; &#x8212; B &amp;</p>');
			done();
		});
	});
});
