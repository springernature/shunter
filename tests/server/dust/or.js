
'use strict';

var assert = require('proclaim');
var helper = require('../../helpers/template.js')();

describe('Dust Helper: or', function () {
	it('Should support a simple or test 1', function (done) {
		helper.render('{@or keys="foo|bar"}foobar{:else}baz{/or}', {
			foo: 'hello'
		}, function (err, dom, out) {
			assert.strictEqual('foobar', out);
			done();
		});
	});

	it('Should support a simple or test 2', function (done) {
		helper.render('{@or keys="foo|bar"}foobar{:else}baz{/or}', {
			bar: 'hello'
		}, function (err, dom, out) {
			assert.strictEqual('foobar', out);
			done();
		});
	});

	it('Should support else in a simple or test', function (done) {
		helper.render('{@or keys="foo|bar"}foobar{:else}baz{/or}', {
			baz: 'hello'
		}, function (err, dom, out) {
			assert.strictEqual('baz', out);
			done();
		});
	});

	it('Should support or with the not option 1', function (done) {
		helper.render('{@or keys="foo|bar" not="true"}foobar{:else}baz{/or}', {
			foo: 'hello',
			bar: 'world'
		}, function (err, dom, out) {
			assert.strictEqual('baz', out);
			done();
		});
	});

	it('Should support or with the not option 2', function (done) {
		helper.render('{@or keys="foo|bar" not="true"}foobar{:else}baz{/or}', {
			foo: 'hello'
		}, function (err, dom, out) {
			assert.strictEqual('foobar', out);
			done();
		});
	});

	it('Should treat an empty array as a falsy value (like dust) 1', function (done) {
		helper.render('{@or keys="foo|bar"}foobar{:else}baz{/or}', {
			foo: [],
			bar: 'hello'
		}, function (err, dom, out) {
			assert.strictEqual('foobar', out);
			done();
		});
	});

	it('Should treat an empty array as a falsy value (like dust) 2', function (done) {
		helper.render('{@or keys="foo|bar"}foobar{:else}baz{/or}', {
			foo: [],
			bar: []
		}, function (err, dom, out) {
			assert.strictEqual('baz', out);
			done();
		});
	});

	it('Should support "or" with nested properties: 1 level', function (done) {
		helper.render('{@or keys="foo|bar.bash"}foobar{:else}baz{/or}', {
			bar: {
				bash: 1
			}
		}, function (err, dom, out) {
			assert.strictEqual('foobar', out);
			done();
		});
	});

	it('Should support "or" with nested properties: 2 levels', function (done) {
		helper.render('{@or keys="foo|bar.bash.wibble"}foobar{:else}baz{/or}', {
			bar: {
				bash: {
					wibble: 1
				}
			}
		}, function (err, dom, out) {
			assert.strictEqual('foobar', out);
			done();
		});
	});

	it('Should support "or" to not return true when only a parent property exists', function (done) {
		helper.render('{@or keys="foo|bar.bash.wibble"}foobar{:else}baz{/or}', {
			bar: {
				bash: 2
			}
		}, function (err, dom, out) {
			assert.strictEqual('baz', out);
			done();
		});
	});

	it('Should support "or" to not return true when there is no parent object', function (done) {
		helper.render('{@or keys="foo|lorem.bash"}foobar{:else}baz{/or}', {
			bar: {
				bash: 2
			}
		}, function (err, dom, out) {
			assert.strictEqual('baz', out);
			done();
		});
	});
});
