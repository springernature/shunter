'use strict';

module.exports = function (url, opts) {
	opts = opts || {};

	const ext = (url.indexOf('.') === -1) ? null : url.split('.').pop().replace(/\?.*/, '');

	const mapping = {
		atom: 'application/atom+xml',
		json: 'application/json',
		rss: 'application/rss+xml',
		rdf: 'application/rdf+xml',
		xml: 'application/xml',
		css: 'text/css',
		ris: 'application/x-research-info-systems',
		txt: 'text/plain'
	};
	return (mapping.hasOwnProperty(ext) ? mapping[ext] : 'text/html') + (opts.charset ? '; charset=' + opts.charset : '');
};
