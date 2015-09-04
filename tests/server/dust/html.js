
'use strict';

var assert = require('proclaim');
var helper = require('../../helpers/template.js')();

describe('Dust Filter: html', function() {
	it('Should safely escape HTML entities', function(done) {
		helper.render('{test1|s|html} {test2|s|html}', {
			test1: '<script>alert("foo") && alert(\'bar\');</script>',
			test2: '&#x8212; & &&amp; < >>> " &#60; &#62;'
		}, function(err, dom, str) {
			assert.strictEqual(str, '&#60;script&#62;alert(&#34;foo&#34;) &amp;&amp; alert(&#39;bar&#39;);&#60;/script&#62; &#x8212; &amp; &amp;&amp; &#60; &#62;&#62;&#62; &#34; &#60; &#62;');
			done();
		});
	});
});
