
'use strict';

var assert = require('proclaim');
var helper = require('../../helpers/template.js')();

describe('Dust Helper: dateFormat', function () {
	it('Should render a date with the default format', function (done) {
		helper.render('{@dateFormat date="2012-11-23" /}', {}, function (err, dom, out) {
			assert.strictEqual('2012-11-23', out);
			done();
		});
	});

	it('Should render a timestamp with the default format', function (done) {
		helper.render('{@dateFormat date="1353668840128" /}', {}, function (err, dom, out) {
			assert.strictEqual('2012-11-23', out);
			done();
		});
	});

	it('Should render a timestamp with a custom format 1', function (done) {
		helper.render('{@dateFormat date="{date}" format="dd mmmm yyyy" /}', {date: (new Date('2012-11-23')).getTime()}, function (err, dom, out) {
			assert.strictEqual('23 November 2012', out);
			done();
		});
	});

	it('Should render a timestamp with a custom format 2', function (done) {
		helper.render('{@dateFormat date="{date}" format="dd mmmm yyyy" /}', {date: (new Date('2012-11-01')).getTime()}, function (err, dom, out) {
			assert.strictEqual('01 November 2012', out);
			done();
		});
	});

	it('Should render a timestamp with a custom format 3', function (done) {
		helper.render('{@dateFormat date="{date}" format="d mmmm yyyy" /}', {date: (new Date('2012-11-23')).getTime()}, function (err, dom, out) {
			assert.strictEqual('23 November 2012', out);
			done();
		});
	});

	it('Should render a timestamp with a custom format 4', function (done) {
		helper.render('{@dateFormat date="{date}" format="d mmmm yyyy" /}', {date: (new Date('2012-11-01')).getTime()}, function (err, dom, out) {
			assert.strictEqual('1 November 2012', out);
			done();
		});
	});

	it('Should render the correct default value and format', function (done) {
		helper.render('{@dateFormat /}', {}, function (err, dom, out1) {
			helper.render('{@dateFormat date="{date}" format="yyyy-mm-dd" /}', {date: (new Date()).getTime()}, function (err, dom, out2) {
				assert.strictEqual(out1, out2);
				done();
			});
		});
	});

	it('Should return an empty string for an invalid date 1', function (done) {
		helper.render('test{@dateFormat date="{date}" format="d mmmm yyyy" /}', {date: '2012-14-1000'}, function (err, dom, out) {
			assert.strictEqual('test', out);
			done();
		});
	});

	it('Should return an empty string for an invalid date 2', function (done) {
		helper.render('test{@dateFormat date="{date}" format="d mmmm yyyy" /}', {date: 'hello'}, function (err, dom, out) {
			assert.strictEqual('test', out);
			done();
		});
	});
});
