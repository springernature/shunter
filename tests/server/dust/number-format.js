
'use strict';

var assert = require('proclaim');
var helper = require('../../helpers/template.js')();

describe('Dust Helper: numberFormat', function() {
	it('Should display zero', function(done) {
		helper.render('{@numberFormat num="{num}"/}', {num: 0}, function(err, dom, out) {
			assert.strictEqual('0', out);
			done();
		});
	});

	it('Should display small numbers without punctuation 1', function(done) {
		helper.render('{@numberFormat num="{num}"/}', {num: 1}, function(err, dom, out) {
			assert.strictEqual('1', out);
			done();
		});
	});

	it('Should display small numbers without punctuation 2', function(done) {
		helper.render('{@numberFormat num="{num}"/}', {num: 123}, function(err, dom, out) {
			assert.strictEqual('123', out);
			done();
		});
	});

	it('Should format numbers with commas 1', function(done) {
		helper.render('{@numberFormat num="{num}"/}', {num: 1234}, function(err, dom, out) {
			assert.strictEqual('1,234', out);
			done();
		});
	});

	it('Should format numbers with commas 2', function(done) {
		helper.render('{@numberFormat num="{num}"/}', {num: 12345}, function(err, dom, out) {
			assert.strictEqual('12,345', out);
			done();
		});
	});

	it('Should format numbers with commas 3', function(done) {
		helper.render('{@numberFormat num="{num}"/}', {num: 123456}, function(err, dom, out) {
			assert.strictEqual('123,456', out);
			done();
		});
	});

	it('Should format numbers with commas 4', function(done) {
		helper.render('{@numberFormat num="{num}"/}', {num: 1234567}, function(err, dom, out) {
			assert.strictEqual('1,234,567', out);
			done();
		});
	});

	it('Should not error on a non numeric value', function(done) {
		helper.render('{@numberFormat num="{num}"/}', {num: 'pass'}, function(err, dom, out) {
			assert.strictEqual('pass', out);
			done();
		});
	});
});
