'use strict';

module.exports = function (url, opts) {
	opts = opts || {};

	var ext = (url.includes('.')) ? url.split('.').pop().replace(/\?.*/, '') : null;

	var mapping = {
		atom: 'application/atom+xml',
		json: 'application/json',
		rss: 'application/rss+xml',
		rdf: 'application/rdf+xml',
		xml: 'application/xml',
		css: 'text/css',
		ris: 'application/x-research-info-systems',
		txt: 'text/plain'
	};

	var mimetype = Object.prototype.hasOwnProperty.call(mapping, ext) ? mapping[ext] : 'text/html';
	var charset = opts.charset ? '; charset=' + opts.charset : '';
	return mimetype + charset;
};
