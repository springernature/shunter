
'use strict';

var assert = require('proclaim');
var helper = require('../../helpers/template.js')();

describe('Dust Filter: trim', function() {
	it('Should trim leading and trailing whitespace from a string', function(done) {
		helper.render('{test|trim}', {
			test: ' \t\r\nhello world   \n\t\r'
		}, function(err, dom, str) {
			assert.strictEqual(str, 'hello world');
			done();
		});
	});

	it('Should not throw if the input is not a string', function(done) {
		helper.render('hello world{test|trim}', {
			test: 3
		}, function(err, dom, str) {
			assert.isNull(err);
			assert.strictEqual(str, 'hello world3');
			done();
		});
	});
});
