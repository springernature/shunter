
'use strict';

var assert = require('proclaim');
var path = require('path');
var helper = require('../../helpers/template.js')();

var rootDir = __dirname.substring(0, __dirname.indexOf('/tests/'));
var templateDir = path.join(rootDir, 'view', 'tests');

describe('Template overriding', function() {
	before(function() {
		helper.setup(
			path.join(templateDir, 'namespace.dust'),
			path.join(templateDir, 'a', 'b', 'loading.dust'),
			path.join(templateDir, 'a', 'loading.dust'),
			path.join(templateDir, 'b', 'loading.dust'),
			path.join(templateDir, 'loading.dust')
		);
	});
	after(helper.teardown);

	it('Should load templates relative to the namespace `tests`', function(done) {
		var json = {
			layout: {
				namespace: 'tests'
			}
		};
		helper.render('namespace', json, function(err, $) {
			assert.isNull(err);

			var expected = [
				{
					template: 'loading',
					path: 'view/tests/loading.dust'
				},
				{
					template: 'a__loading',
					path: 'view/tests/a/loading.dust'
				},
				{
					template: 'b__loading',
					path: 'view/tests/b/loading.dust'
				},
				{
					template: 'a__b__loading',
					path: 'view/tests/a/b/loading.dust'
				}
			];

			$('[data-test="templates"]').children('dd').each(function(i, item) {
				assert.strictEqual(expected[i].path, $(item).text(), 'Loading template ' + expected[i].template);
			});
			done();
		});
	});

	it('Should load templates relative to the namespace `tests__a`', function(done) {
		var json = {
			layout: {
				namespace: 'tests__a'
			}
		};
		helper.render('namespace', json, function(err, $) {
			assert.isNull(err);

			var expected = [
				{
					template: 'loading',
					path: 'view/tests/a/loading.dust'
				},
				{
					template: 'a__loading',
					path: 'view/tests/a/loading.dust'
				},
				{
					template: 'b__loading',
					path: 'view/tests/a/b/loading.dust'
				},
				{
					template: 'a__b__loading',
					path: 'view/tests/a/b/loading.dust'
				}
			];

			$('[data-test="templates"]').children('dd').each(function(i, item) {
				assert.strictEqual(expected[i].path, $(item).text(), 'Loading template ' + expected[i].template);
			});
			done();
		});
	});

	it('Should load templates relative to the namespace `tests__b`', function(done) {
		var json = {
			layout: {
				namespace: 'tests__b'
			}
		};
		helper.render('namespace', json, function(err, $) {
			assert.isNull(err);

			var expected = [
				{
					template: 'loading',
					path: 'view/tests/b/loading.dust'
				},
				{
					template: 'a__loading',
					path: 'view/tests/a/loading.dust'
				},
				{
					template: 'b__loading',
					path: 'view/tests/b/loading.dust'
				},
				{
					template: 'a__b__loading',
					path: 'view/tests/a/b/loading.dust'
				}
			];

			$('[data-test="templates"]').children('dd').each(function(i, item) {
				assert.strictEqual(expected[i].path, $(item).text(), 'Loading template ' + expected[i].template);
			});
			done();
		});
	});

	it('Should load templates relative to the namespace `tests__a__b`', function(done) {
		var json = {
			layout: {
				namespace: 'tests__a__b'
			}
		};
		helper.render('namespace', json, function(err, $) {
			assert.isNull(err);

			var expected = [
				{
					template: 'loading',
					path: 'view/tests/a/b/loading.dust'
				},
				{
					template: 'a__loading',
					path: 'view/tests/a/loading.dust'
				},
				{
					template: 'b__loading',
					path: 'view/tests/a/b/loading.dust'
				},
				{
					template: 'a__b__loading',
					path: 'view/tests/a/b/loading.dust'
				}
			];

			$('[data-test="templates"]').children('dd').each(function(i, item) {
				assert.strictEqual(expected[i].path, $(item).text(), 'Loading template ' + expected[i].template);
			});
			done();
		});
	});
});
