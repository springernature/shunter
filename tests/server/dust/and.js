
'use strict';

var assert = require('proclaim');
var helper = require('../../helpers/template.js')();

describe('Dust Helper: and', function() {
	it('Should treat an empty array as a falsy value (like dust) 3', function(done) {
		helper.render('{@and keys="foo|bar"}foobar{:else}baz{/and}', {
			foo: [],
			bar: 'hello'
		}, function(err, dom, out) {
			assert.strictEqual('baz', out);
			done();
		});
	});

	it('Should treat an empty array as a falsy value (like dust) 4', function(done) {
		helper.render('{@and keys="foo|bar"}foobar{:else}baz{/and}', {
			foo: [],
			bar: []
		}, function(err, dom, out) {
			assert.strictEqual('baz', out);
			done();
		});
	});

	it('Should support a simple and test 1', function(done) {
		helper.render('{@and keys="foo|bar"}foobar{:else}baz{/and}', {
			foo: 'hello'
		}, function(err, dom, out) {
			assert.strictEqual('baz', out);
			done();
		});
	});

	it('Should support a simple and test 2', function(done) {
		helper.render('{@and keys="foo|bar"}foobar{:else}baz{/and}', {
			bar: 'hello'
		}, function(err, dom, out) {
			assert.strictEqual('baz', out);
			done();
		});
	});

	it('Should support a simple and test 3', function(done) {
		helper.render('{@and keys="foo|bar"}foobar{:else}baz{/and}', {
			foo: 'hello',
			bar: 'world'
		}, function(err, dom, out) {
			assert.strictEqual('foobar', out);
			done();
		});
	});

	it('Should support and with the not option 1', function(done) {
		helper.render('{@and keys="foo|bar" not="true"}foobar{:else}baz{/and}', {
			foo: 'hello',
			bar: 'world'
		}, function(err, dom, out) {
			assert.strictEqual('baz', out);
			done();
		});
	});

	it('Should support and with the not option 2', function(done) {
		helper.render('{@and keys="foo|bar" not="true"}foobar{:else}baz{/and}', {
			foo: 'hello'
		}, function(err, dom, out) {
			assert.strictEqual('baz', out);
			done();
		});
	});

	it('Should support and with the not option 3', function(done) {
		helper.render('{@and keys="foo|bar" not="true"}foobar{:else}baz{/and}', {
			baz: 'hello'
		}, function(err, dom, out) {
			assert.strictEqual('foobar', out);
			done();
		});
	});
	it('Should support "and" with nested properties: 1 level', function(done) {
		helper.render('{@and keys="foo|bar.bash"}foobar{:else}baz{/and}', {
			foo: '1',
			bar: {
				bash: '2'
			}
		}, function(err, dom, out) {
			assert.strictEqual('foobar', out);
			done();
		});
	});
	it('Should support "and" with nested properties: 2 levels', function(done) {
		helper.render('{@and keys="foo|bar.bash.wibble"}foobar{:else}baz{/and}', {
			foo: '1',
			bar: {
				bash: {
					wibble: '3'
				}
			}
		}, function(err, dom, out) {
			assert.strictEqual('foobar', out);
			done();
		});
	});
	it('Should support "and" to not return true for parents of nested properties', function(done) {
		helper.render('{@and keys="foo|bar.bash.wibble"}foobar{:else}baz{/and}', {
			foo: '1',
			bar: {
				bash: '3'
			}
		}, function(err, dom, out) {
			assert.strictEqual('baz', out);
			done();
		});
	});
	it('Should support "and" returning false if parent object is undefined', function(done) {
		helper.render('{@and keys="foo|lorem.bash"}foobar{:else}baz{/and}', {
			foo: '1',
			bar: {
				bash: '3'
			}
		}, function(err, dom, out) {
			assert.strictEqual('baz', out);
			done();
		});
	});
});
