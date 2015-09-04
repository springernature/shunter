'use strict';

var assert = require('proclaim');
var mockery = require('mockery');
var sinon = require('sinon');

var moduleName = '../../../lib/watcher';

describe('Watcher watchTree', function() {
	var watchTree;
	var gaze;
	var Gaze;

	beforeEach(function() {
		var watcherMod;
		mockery.enable({
			useCleanCache: true,
			warnOnUnregistered: false,
			warnOnReplace: false
		});
		watcherMod = require(moduleName)('.dust');
		watchTree = watcherMod.watchTree;
	});

	afterEach(function() {
		mockery.deregisterAll();
		mockery.disable();
	});

	describe('Gaze setup', function() {
		beforeEach(function() {
			Gaze = sinon.spy();
			Gaze.prototype.on = sinon.spy();
			Gaze.prototype.emit = sinon.spy();
			mockery.registerMock('gaze', Gaze);
			gaze = require('gaze');
		});
		it('Should be a function', function() {
			assert.isFunction(watchTree);
		});
		it('Should return an instance of gaze', function() {
			var wt = watchTree([], require('../mocks/log'));
			assert.isTrue(gaze.calledWithNew());
			assert.instanceOf(wt, gaze);
		});
		it('Should create a watcher with the given directory, globbed for dust templates', function() {
			watchTree('foo', require('../mocks/log'));
			assert.isTrue(gaze.withArgs('foo/**/*.dust').calledOnce);
		});
		it('Should create a watcher with more than one directory', function() {
			watchTree(['foo', 'bar'], require('../mocks/log'));
			assert.isTrue(gaze.withArgs(['foo/**/*.dust', 'bar/**/*.dust']).calledOnce);
		});
	});

	describe('Watched Events', function() {
		var emitSpy;
		var wt;
		beforeEach(function() {
			wt = watchTree('foo', require('../mocks/log'));
			emitSpy = sinon.spy(wt, 'emit');
		});
		it('Should emit a fileCreated event when a file is created', function() {
			wt.emit('added', 'foopath');
			assert(emitSpy.calledWith('fileCreated', 'foopath'));
		});
		it('Should emit a fileModified event when a file is modified', function() {
			wt.emit('changed', 'barpath');
			assert(emitSpy.calledWith('fileModified', 'barpath'));

		});
	});
});
