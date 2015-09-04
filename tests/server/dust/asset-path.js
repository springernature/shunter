
'use strict';

var assert = require('proclaim');
var helper = require('../../helpers/template.js')();

describe('Dust Helper: assetPath', function() {
	it('Should render an asset path', function(done) {
		helper.render('{@assetPath src="test.css"/}', {}, function(err, dom, out) {
			assert.strictEqual('test.css', out);
			done();
		});
	});

	it('Should render an asset path from a variable', function(done) {
		helper.render('{@assetPath src="{foo}.css"/}', {foo: 'test'}, function(err, dom, out) {
			assert.strictEqual('test.css', out);
			done();
		});
	});
});
