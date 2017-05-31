'use strict';

var assert = require('proclaim');
var sinon = require('sinon');
var mockery = require('mockery');

var mockConfig = {
	modules: [
		'shunter'
	],
	path: {
		root: '/',
		resources: '/resources',
		publicResources: '/public/resources',
		templates: '/view',
		dust: '/dust'
	},
	web: {
		public: '/public',
		publicResources: '/public/resources',
		resources: '/resources'
	},
	structure: {
		resources: 'resources',
		styles: 'css',
		images: 'img',
		scripts: 'js',
		fonts: 'fonts',
		templates: 'view',
		dust: 'dust',
		templateExt: '.dust',
		filters: 'filters',
		filtersInput: 'input',
		ejs: 'ejs',
		mincer: 'mincer'
	},
	log: require('../mocks/log'),
	timer: sinon.stub().returns(sinon.stub()),
	env: {
		tier: sinon.stub().returns('ci'),
		host: sinon.stub().returns(''),
		isProduction: sinon.stub().returns(true)
	}
};

var mockRequest = {
	url: '/test'
};

var mockResponse = {};

var RENDERER_MODULE = '../../../lib/renderer';

describe('Renderer', function () {
	var watcher;
	var inputFilter;
	var config;

	beforeEach(function () {
		mockery.enable({
			useCleanCache: true,
			warnOnUnregistered: false,
			warnOnReplace: false
		});

		config = require('../../../lib/config')('development', null, {});
		config.timer = function () {
			return function () {};
		};

		watcher = require('../mocks/watcher');
		inputFilter = require('../mocks/input-filter');

		mockery.registerMock('mincer', require('../mocks/mincer'));
		mockery.registerMock('fs', require('../mocks/fs'));
		mockery.registerMock('path', require('../mocks/path'));
		mockery.registerMock('each-module', require('../mocks/each-module'));
		mockery.registerMock('dustjs-helpers', require('../mocks/dustjs-helpers'));
		mockery.registerMock('glob', require('../mocks/glob'));
		mockery.registerMock('./watcher', watcher);
		mockery.registerMock('./input-filter', inputFilter);
	});

	afterEach(function () {
		mockery.deregisterAll();
		mockery.disable();
		mockConfig.env.isProduction.returns(true);
		mockConfig.log.error.reset();
		mockConfig.structure.templates = 'view';
	});

	describe('Asset handling', function () {
		it('Should setup the logger for mincer', function () {
			require('fs').readdirSync.returns([]);

			var mincer = require('mincer');

			require(RENDERER_MODULE)(mockConfig);

			assert.isTrue(mincer.logger.use.calledOnce);
		});

		it('Should setup mincer extensions', function () {
			require('path').join.returnsArg(1);
			var initMincerExtension = sinon.stub();
			var eachModule = require('each-module');
			var mincer = require('mincer');
			eachModule.withArgs('mincer').yields('foo', initMincerExtension);

			require(RENDERER_MODULE)(mockConfig);
			assert.strictEqual(eachModule.withArgs('mincer').callCount, 3);
			assert.strictEqual(initMincerExtension.callCount, 3);
			assert.isTrue(initMincerExtension.calledWith(mincer, mockConfig));
		});

		it('Should skip mincer extensions that do not expose a function', function () {
			require('path').join.returnsArg(1);
			var initMincerExtension = sinon.stub();
			var eachModule = require('each-module');
			eachModule.withArgs('mincer').yields('foo', initMincerExtension);
			eachModule.withArgs('mincer').onCall(1).yields('foo', 'bar');

			require(RENDERER_MODULE)(mockConfig);
			assert.strictEqual(eachModule.withArgs('mincer').callCount, 3);
			assert.strictEqual(initMincerExtension.callCount, 2);
		});

		it('Should setup the `asset_path` ejs helper', function () {
			var renderer = require(RENDERER_MODULE)(mockConfig);
			assert.strictEqual(renderer.environment.registerHelper.withArgs('asset_path').callCount, 1);
		});

		it('Should setup additional ejs helpers', function () {
			require('path').join.returnsArg(1);
			var helper = sinon.stub();
			var eachModule = require('each-module');
			eachModule.withArgs('ejs').yields('foo', helper);

			var renderer = require(RENDERER_MODULE)(mockConfig);
			assert.strictEqual(eachModule.withArgs('ejs').callCount, 3);
			assert.strictEqual(helper.callCount, 3);
			assert.isTrue(helper.calledWith(renderer.environment, renderer.manifest, mockConfig));
		});

		it('Should skip ejs helpers that do not expose a function', function () {
			require('path').join.returnsArg(1);
			var helper = sinon.stub();
			var eachModule = require('each-module');
			eachModule.withArgs('ejs').yields('foo', helper);
			eachModule.withArgs('ejs').onCall(1).yields('foo', 'bar');

			require(RENDERER_MODULE)(mockConfig);
			assert.strictEqual(eachModule.withArgs('ejs').callCount, 3);
			assert.strictEqual(helper.callCount, 2);
		});

		it('Should setup input filters', function () {
			require('path').join.returnsArg(1);
			var filter = sinon.stub();
			var eachModule = require('each-module');
			eachModule.withArgs('filters').yields('foo', filter);
			require(RENDERER_MODULE)(mockConfig);
			assert.strictEqual(eachModule.withArgs('filters').callCount, 3);
			assert.strictEqual(inputFilter().add.withArgs(filter).callCount, 3);
		});

		it('Should skip input filters that do not expose a function', function () {
			require('path').join.returnsArg(1);
			var filter = sinon.stub();
			var eachModule = require('each-module');
			eachModule.withArgs('filters').yields('foo', filter);
			eachModule.withArgs('filters').onCall(1).yields('foo', 'bar');
			require(RENDERER_MODULE)(mockConfig);
			assert.strictEqual(eachModule.withArgs('filters').callCount, 3);
			assert.strictEqual(inputFilter().add.withArgs(filter).callCount, 2);
		});

		// It('Should configure the asset paths in the correct order', function() {
		// 	require('fs').readdirSync.returns([]);
		// 	require('fs').existsSync.returns(true);
		// 	require('path').join.returnsArg(1);

		// 	var renderer = require(RENDERER_MODULE)(mockConfig);
		// 	assert.strictEqual(renderer.environment.appendPath.callCount, 8);
		// 	assert.isTrue(renderer.environment.appendPath.firstCall.calledWith('fonts'));
		// 	assert.isTrue(renderer.environment.appendPath.secondCall.calledWith('img'));
		// 	assert.isTrue(renderer.environment.appendPath.thirdCall.calledWith('css'));
		// 	assert.isTrue(renderer.environment.appendPath.lastCall.calledWith('js'));
		// });

		// Commenting out for now; we no longer deal with themes, but we may want to replicate
		// similar tests when we rewrite the asset loading logic for the new application structure
		//

		it('Should append the asset paths for the host app, in the correct order (i.e. on odd iterations)', function () {
			require('fs').existsSync.returns(true);
			require('fs').mockStatReturn.isDirectory.returns(true);
			require('path').join.returnsArg(1);

			var renderer = require(RENDERER_MODULE)(mockConfig);
			assert.strictEqual(renderer.environment.appendPath.callCount, 8);
			assert.isTrue(renderer.environment.appendPath.firstCall.calledWith('fonts'));
			assert.isTrue(renderer.environment.appendPath.thirdCall.calledWith('img'));
			assert.isTrue(renderer.environment.appendPath.getCall(4).calledWith('css'));
			assert.isTrue(renderer.environment.appendPath.getCall(6).calledWith('js'));
		});

		it('Should configure the asset paths for the modules after the host app ones, in the correct order (i.e. on even iterations)', function () {
			require('fs').existsSync.returns(true);
			require('fs').mockStatReturn.isDirectory.returns(true);
			require('path').join.returnsArg(2);

			var renderer = require(RENDERER_MODULE)(mockConfig);
			assert.strictEqual(renderer.environment.appendPath.callCount, 8);
			assert.isTrue(renderer.environment.appendPath.secondCall.calledWith('fonts'));
			assert.isTrue(renderer.environment.appendPath.getCall(3).calledWith('img'));
			assert.isTrue(renderer.environment.appendPath.getCall(5).calledWith('css'));
			assert.isTrue(renderer.environment.appendPath.getCall(7).calledWith('js'));
		});

		it('Should not configure asset paths for files in a module that is not explicitly included', function () {
			var tempConfigModules = mockConfig.modules;
			mockConfig.modules = [];
			require('fs').existsSync.returns(true);
			require('fs').mockStatReturn.isDirectory.returns(false);
			require('path').join.returnsArg(1);

			var renderer = require(RENDERER_MODULE)(mockConfig);
			assert.strictEqual(renderer.environment.appendPath.callCount, 4);
			mockConfig.modules = tempConfigModules;
		});

		it('Should create an asset server for the environment', function () {
			require('fs').readdirSync.returns([]);

			var mincer = require('mincer');
			var renderer = require(RENDERER_MODULE)(mockConfig);

			renderer.assetServer();

			assert.isTrue(mincer.createServer.calledOnce);
			assert.isTrue(mincer.createServer.calledWith(renderer.environment));
		});

		it('Should return an asset from the environment in dev mode', function () {
			require('fs').readdirSync.returns([]);
			mockConfig.env.isProduction.returns(false);

			var renderer = require(RENDERER_MODULE)(mockConfig);

			require('path').join.returnsArg(1);
			renderer.environment.findAsset.returns({
				digestPath: 'test-env-md5.css'
			});

			var asset = renderer.assetPath('test.css');
			assert.strictEqual(asset, 'test-env-md5.css');
		});

		it('Should return an asset from the manifest in production mode', function () {
			require('fs').readdirSync.returns([]);

			var renderer = require(RENDERER_MODULE)(mockConfig);

			require('path').join.returnsArg(1);

			var asset = renderer.assetPath('test.css');
			assert.strictEqual(asset, 'test-prod-md5.css');
		});

		it('Should return an empty string if the asset isn\'t found', function () {
			require('fs').readdirSync.returns([]);

			var renderer = require(RENDERER_MODULE)(mockConfig);

			require('path').join.returnsArg(1);

			var asset = renderer.assetPath('test-not-found.css');
			assert.strictEqual(asset, '');
		});
	});

	describe('Template compilation', function () {
		it('Should watch the default templates directories', function () {
			require('fs').readdirSync.returns([]);
			require('path').join.returns('/module/view');
			var renderer = require(RENDERER_MODULE)(mockConfig);

			renderer.watchTemplates();
			assert.isTrue(watcher().watchTree.calledOnce);
			assert.isTrue(watcher().watchTree.calledWith(['view', '/module/view'], mockConfig.log));
			assert.isTrue(watcher().watchTree().on.calledWith('fileModified'));
			assert.isTrue(watcher().watchTree().on.calledWith('fileCreated'));
		});

		it('Should watch the configured templates directories', function () {
			require('fs').readdirSync.returns([]);
			require('path').join.returns('/module/templates');
			var alternativeMockConfig = mockConfig;
			alternativeMockConfig.structure.templates = 'templates';
			var renderer = require(RENDERER_MODULE)(alternativeMockConfig);

			renderer.watchTemplates();
			assert.isTrue(watcher().watchTree.calledOnce);
			assert.isTrue(watcher().watchTree.calledWith(['templates', '/module/templates'], mockConfig.log));
			assert.isTrue(watcher().watchTree().on.calledWith('fileModified'));
			assert.isTrue(watcher().watchTree().on.calledWith('fileCreated'));
		});

		it('Should create cached compiled templates with namespaced key ids', function () {
			require('fs').readdirSync.returns([]);

			var renderer = require(RENDERER_MODULE)(mockConfig);
			var fsync = require('fs').readFileSync.returns('filetemplate content');

			require('path').extname.returns('.dust');
			require('path').relative.returns('foo/bar/foo.dust');
			renderer.dust.compile.returns('compiled');

			renderer.compileFile('foo/bar/foo.dust');

			assert.isTrue(fsync.calledOnce);
			assert.strictEqual(fsync.firstCall.args[0], 'foo/bar/foo.dust');
			assert.isTrue(renderer.dust.compile.calledOnce);
			assert.strictEqual(renderer.dust.compile.firstCall.args[0], 'filetemplate content');
			assert.strictEqual(renderer.dust.compile.firstCall.args[1], 'root__foo__bar__foo');
			assert.isTrue(renderer.dust.loadSource.calledOnce);
			assert.strictEqual(renderer.dust.loadSource.firstCall.args[0], 'compiled');
		});

		it('Should gracefully handle dust compilation errors', function () {
			require('fs').readdirSync.returns([]);

			var renderer = require(RENDERER_MODULE)(mockConfig);

			require('fs').readFileSync.returns('invalid content');

			require('path').extname.returns('.dust');
			require('path').relative.returns('foo/bar/foo.dust');
			renderer.dust.compile.withArgs('invalid content').throws({message: 'FAILED'});

			assert.doesNotThrow(function () {
				renderer.compileFile('foo/bar/foo.dust');
			});
			assert.isTrue(mockConfig.log.error.calledOnce);
			assert.include(mockConfig.log.error.firstCall.args[0], 'FAILED');
			assert.include(mockConfig.log.error.firstCall.args[0], 'foo/bar/foo.dust');
		});

		it('Removes the \'/view/\' part of the path and anything before', function () {
			require('fs').readdirSync.returns([]);

			var renderer = require(RENDERER_MODULE)(mockConfig);

			require('fs').readFileSync.returns('filetemplate content');

			require('path').extname.returns('.dust');
			require('path').relative.returns('foo/view/bar/foo.dust');

			renderer.compileFile('foo/view/bar/foo.dust');

			assert.strictEqual(renderer.dust.compile.firstCall.args[1], 'root__bar__foo');
		});

		// DEPRECATED: handling '..'from relative as /view still exists while transferring to themes
		it('Removes the \'/view/\' part of the path (DEPRECATED)', function () {
			require('fs').readdirSync.returns([]);

			var renderer = require(RENDERER_MODULE)(mockConfig);

			require('fs').readFileSync.returns('filetemplate content');

			require('path').extname.returns('.dust');
			require('path').relative.returns('../view/foo.dust');

			renderer.compileFile('../view/foo.dust');

			assert.equal(renderer.dust.compile.firstCall.args[1], 'root__foo');
		});

		it('Should recompile templates when a file changes', function () {
			require('fs').readdirSync.returns([]);

			var renderer = require(RENDERER_MODULE)(mockConfig);

			sinon.stub(renderer, 'compileFile');
			renderer.watchTemplates();

			watcher().watchTree().on.withArgs('fileModified').firstCall.yield('/view/article.dust');
			assert.isTrue(renderer.compileFile.calledOnce);
			assert.isTrue(renderer.compileFile.calledWith('/view/article.dust'));
			watcher().watchTree().on.withArgs('fileCreated').firstCall.yield('/view/new-article.dust');
			assert.isTrue(renderer.compileFile.calledTwice);
			assert.isTrue(renderer.compileFile.calledWith('/view/new-article.dust'));

			renderer.compileFile.restore();
		});

		it('Should compile an array of file paths', function () {
			require('fs').readdirSync.returns([]);

			var renderer = require(RENDERER_MODULE)(mockConfig);

			require('path').extname.returns('.dust');
			require('path').join.returnsArg(1);
			require('path').relative.returnsArg(1);
			require('fs').readFileSync.returns('test');
			require('fs').existsSync.returns(true);

			renderer.dust.compile.returns('compiled');
			renderer.compilePaths(['foo.dust', 'bar/bash.dust']);

			assert.strictEqual(renderer.dust.compile.callCount, 2);
			assert.isTrue(renderer.dust.compile.firstCall.calledWith('test', 'root__foo'));
			assert.isTrue(renderer.dust.compile.secondCall.calledWith('test', 'root__bar__bash'));
			assert.strictEqual(renderer.dust.loadSource.callCount, 2);
			assert.isTrue(renderer.dust.loadSource.calledWith('compiled'));
		});

		it('Should compile file paths as an argument list', function () {
			require('fs').readdirSync.returns([]);

			var renderer = require(RENDERER_MODULE)(mockConfig);

			require('path').extname.returns('.dust');
			require('path').join.returnsArg(1);
			require('path').relative.returns('');
			require('fs').readFileSync.returns('test');
			require('fs').existsSync.returns(true);

			renderer.dust.compile.returns('compiled');
			renderer.compilePaths('meh.dust', 'bleh.dust');

			assert.strictEqual(renderer.dust.compile.callCount, 2);
			assert.isTrue(renderer.dust.compile.firstCall.calledWith('test', 'root__meh'));
			assert.isTrue(renderer.dust.compile.secondCall.calledWith('test', 'root__bleh'));
			assert.strictEqual(renderer.dust.loadSource.callCount, 2);
			assert.isTrue(renderer.dust.loadSource.calledWith('compiled'));
		});

		it('Should not compile anything without a .dust extension', function () {
			require('fs').readdirSync.returns([]);

			var renderer = require(RENDERER_MODULE)(mockConfig);

			require('path').extname.returns('.php');
			require('path').join.returnsArg(1);
			require('fs').existsSync.returns(true);

			renderer.dust.compile.returns('compiled');
			renderer.compilePaths('meh.php', 'bleh.php');

			assert.strictEqual(renderer.dust.compile.callCount, 0);
			assert.strictEqual(renderer.dust.loadSource.callCount, 0);
		});

		it('Should select all dust files from application\'s configured template directory\'s subfolders', function () {
			require('fs').readdirSync.returns([]);
			var renderer = require(RENDERER_MODULE)(mockConfig);
			var gsync = require('glob').sync.returns(['filepath']);
			sinon.spy(renderer, 'compileFileList');
			renderer.compileTemplates();
			assert.isTrue(gsync.calledTwice);
			assert.isTrue(gsync.calledWith('/view/**/*.dust'));
			assert.isTrue(renderer.compileFileList.called);
			assert.isTrue(renderer.compileFileList.calledWith(['filepath', 'filepath']));
		});

		it('Should compile each file from a list of files', function () {
			require('fs').readdirSync.returns([]);

			var renderer = require(RENDERER_MODULE)(mockConfig);
			var list = ['foo.dust', 'bar/bash.dust'];

			sinon.spy(renderer, 'compileFile');

			renderer.compileFileList(list);

			assert.strictEqual(renderer.compileFile.callCount, list.length);
			assert.strictEqual(renderer.compileFile.firstCall.args[0], 'foo.dust');
			assert.strictEqual(renderer.compileFile.secondCall.args[0], 'bar/bash.dust');
		});
	});

	describe('Dust extension loading', function () {
		it('Should watch the dust directories', function () {
			require('fs').readdirSync.returns([]);
			require('path').join.returns('/module/dust');
			var renderer = require(RENDERER_MODULE)(mockConfig);

			renderer.watchDustExtensions();
			assert.isTrue(watcher().watchTree.calledOnce);
			assert.isTrue(watcher().watchTree.calledWith(['/dust', '/module/dust'], mockConfig.log));
			assert.isTrue(watcher().watchTree().on.calledWith('fileModified'));
			assert.isTrue(watcher().watchTree().on.calledWith('fileCreated'));
		});
	});

	describe('Rendering', function () {
		it('Should default to rendering the layout template unless one is specified', function () {
			require('fs').readdirSync.returns([]);

			var renderer = require(RENDERER_MODULE)(mockConfig);

			sinon.stub(renderer, 'renderPartial');
			renderer.render(mockRequest, mockResponse, {
				foo: 'bar'
			}, function () { });

			assert.isTrue(renderer.renderPartial.calledWith('layout'));

			renderer.renderPartial.restore();
		});

		it('Should select a layout template from the data', function () {
			require('fs').readdirSync.returns([]);

			var renderer = require(RENDERER_MODULE)(mockConfig);

			sinon.stub(renderer, 'renderPartial');
			renderer.render(mockRequest, mockResponse, {
				layout: {
					template: 'test-layout'
				}
			}, function () { });

			assert.isTrue(renderer.renderPartial.calledWith('test-layout'));

			renderer.renderPartial.restore();
		});

		it('Should render a dust template after applying filters', function () {
			require('fs').readdirSync.returns([]);

			var renderer = require(RENDERER_MODULE)(mockConfig);

			var callback = sinon.stub();
			var data = {
				foo: 'bar'
			};
			var filteredData = {
				foo: 'bar',
				baz: 'qux'
			};

			renderer.renderPartial('template', mockRequest, mockResponse, data, callback);

			inputFilter().run.withArgs(mockRequest, mockResponse, data).firstCall.yield(filteredData);
			renderer.dust.render.withArgs('template', filteredData).firstCall.yield(null, 'Content!');

			assert.isTrue(inputFilter().run.calledOnce);
			assert.isTrue(inputFilter().run.calledWith(mockRequest, mockResponse, data));
			assert.isTrue(renderer.dust.render.calledOnce);
			assert.isTrue(renderer.dust.render.calledWith('template', filteredData));
			assert.isTrue(callback.calledOnce);
			assert.isTrue(callback.calledWith(null, 'Content!'));
		});
	});
});

