'use strict';

var assert = require('proclaim');

var moduleName = '../../../lib/map-route';

describe('Mapping a route', function () {
	it('Should map a route with a protocol, hostname and port', function () {
		var route = require(moduleName)('http://www.foo.com:80');
		assert.equal(route.protocol, 'http:');
		assert.equal(route.host, 'www.foo.com');
		assert.equal(route.port, 80);
	});

	it('Should map a route with a protocol, subdomain, hostname and port', function () {
		var route = require(moduleName)('https://foo-www.somehost-name.bar.com:80');
		assert.equal(route.protocol, 'https:');
		assert.equal(route.host, 'foo-www.somehost-name.bar.com');
		assert.equal(route.port, 80);
	});

	it('Should map a route with a protocol, subdomain, hostname and no port', function () {
		var route = require(moduleName)('http://somehost-name.foo.com');
		assert.equal(route.protocol, 'http:');
		assert.equal(route.host, 'somehost-name.foo.com');
		assert.equal(route.port, null);
	});

	it('Should map a route with an IPv4 address and port', function () {
		var route = require(moduleName)('127.0.0.1:9000');
		assert.equal(route.protocol, 'http:');
		assert.equal(route.host, '127.0.0.1');
		assert.equal(route.port, 9000);
	});

	it('Should map a route with an IPv4 address and no port', function () {
		var route = require(moduleName)('8.8.8.8');
		assert.equal(route.protocol, 'http:');
		assert.equal(route.host, '8.8.8.8');
		assert.equal(route.port, null);
	});

	it('Should map a route with a protocol and a IPv4 address and a port', function () {
		var route = require(moduleName)('https://8.8.8.8:80');
		assert.equal(route.protocol, 'https:');
		assert.equal(route.host, '8.8.8.8');
		assert.equal(route.port, 80);
	});

	it('Should map a route with a protocol and a IPv4 address and no port', function () {
		var route = require(moduleName)('https://8.8.8.8');
		assert.equal(route.protocol, 'https:');
		assert.equal(route.host, '8.8.8.8');
		assert.equal(route.port, null);
	});

	it('Should default to mapping a hostname protocol to http', function () {
		var route = require(moduleName);
		assert.equal(route('localhost').host, 'localhost');
		assert.equal(route('localhost').protocol, 'http:');

		assert.equal(route('foo.com').host, 'foo.com');
		assert.equal(route('localhost').protocol, 'http:');
	});
});
