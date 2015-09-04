'use strict';

var assert = require('proclaim');

var moduleName = '../../../lib/content-type';

describe('Get the content type', function() {
	it('Should find the content type from the file extension', function() {
		var contentType = require(moduleName);
		assert.equal(contentType('/nutd/sitemap.xml'), 'application/xml');
		assert.equal(contentType('file.txt'), 'text/plain');
	});

	it('Should allow the charset to be specified', function() {
		var contentType = require(moduleName);
		assert.equal(contentType('/nutd/sitemap.xml', {charset: 'utf-8'}), 'application/xml; charset=utf-8');
		assert.equal(contentType('file.txt', {charset: 'ISO-8859-8'}), 'text/plain; charset=ISO-8859-8');
	});

	it('Should find the content type from the file extension ignoring any query params', function() {
		var contentType = require(moduleName);
		assert.equal(contentType('/feed.atom?foo=bar'), 'application/atom+xml');
	});

	it('Should fall back to text/html as default', function() {
		var contentType = require(moduleName);
		assert.equal(contentType('foo'), 'text/html');
		assert.equal(contentType('bar.html'), 'text/html');
		assert.equal(contentType('baz.fake'), 'text/html');
	});
});
