'use strict';

module.exports = function (config) {
	const dust = require('dustjs-helpers');
	const mincer = require('mincer');
	const fs = require('fs');
	const path = require('path');
	const glob = require('glob');
	const inputFilters = require('./input-filter')(config);
	const eachModule = require('each-module');

	const hostAppDir = config.path.root;
	const modulesPaths = config.modules.map(function (module) {
		return path.join(hostAppDir, 'node_modules', module);
	});

	mincer.logger.use(config.log);

	const initExtensions = function () {
		const paths = [].slice.call(arguments, 0, -1);
		const callback = arguments[arguments.length - 1];
		const locations = [config.path.shunterRoot].concat(modulesPaths, hostAppDir);

		if (typeof callback === 'function') {
			locations.forEach(function (dir) {
				const extensionPath = path.join.apply(path, [dir].concat(paths));
				eachModule(extensionPath, callback);
			});
		}
	};

	// Load input filters from host app and modules
	initExtensions(config.structure.filters, config.structure.filtersInput, function (name, inputFilter) {
		if (typeof inputFilter === 'function') {
			inputFilters.add(inputFilter);
		}
	});

	// Load mincer extensions from the host app and modules
	initExtensions(config.structure.mincer, function (name, initMincerExtension) {
		if (typeof initMincerExtension === 'function') {
			initMincerExtension(mincer, config);
		}
	});

	const environment = new mincer.Environment();
	const manifest = new mincer.Manifest(environment, config.path.publicResources);
	// Host app can be shunter-based app or manifest, so rely on root

	const assetPath = function (name) {
		const isProduction = config.env.isProduction();
		const asset = (isProduction) ? manifest.assets[name] : environment.findAsset(name);
		if (!asset) {
			return '';
		}
		const mountPath = config.argv && (config.argv['mount-path'] || '');

		return (
			isProduction ?
				path.join(mountPath, config.web.publicResources, asset) :
				path.join(mountPath, config.web.resources, asset.digestPath)
		);
	};

	const linkPath = function (link) {
		const mountPath = config.argv && (config.argv['mount-path'] || '');
		return path.join(mountPath, link);
	};

	environment.registerHelper('asset_path', assetPath);
	environment.registerHelper('link_path', linkPath);
	// Assets must be loaded in order (e.g. styles relies on images already being available)
	const assetTypes = [config.structure.fonts, config.structure.images, config.structure.styles, config.structure.scripts];
	const themeResourcesPath = config.path.resources;
	// NB: risk of mincer clashes until stuff is moved out of proxy
	// for each asset type, add host then module. this order is important
	assetTypes.forEach(function (assetType) {
		const newPath = path.join(themeResourcesPath, assetType);
		if (fs.existsSync(newPath)) {
			environment.appendPath(newPath);
		}
		modulesPaths.reverse().forEach(function (modulePath) {
			const newPath = path.join(modulePath, 'resources', assetType);
			if (fs.existsSync(newPath)) {
				environment.appendPath(newPath);
			}
		});
	});

	// Load ejs helpers from the host app and modules
	initExtensions(config.structure.ejs, function (name, initEjsHelper) {
		if (typeof initEjsHelper === 'function') {
			initEjsHelper(environment, manifest, config);
		}
	});

	return {
		TEMPLATE_CACHE_KEY_PREFIX: 'root',

		dust: dust,
		environment: environment,
		manifest: manifest,
		assetPath: assetPath,
		linkPath: linkPath,

		assetServer: function () {
			return mincer.createServer(environment);
		},

		initDustExtensions: function () {
			require('./dust')(dust, this, config);
			initExtensions(config.structure.dust, function (name, initDustExtension) {
				if (typeof initDustExtension === 'function') {
					initDustExtension(dust, this, config);
				}
			}.bind(this));
		},

		compileFile: function (fp) {
			const ext = config.structure.templateExt;
			let id;
			let compiled;
			let sandboxNS;
			let splitPath;
			let timer;

			if (path.extname(fp) === ext) {
				sandboxNS = fp;
				// Trim out the relative paths of inherited templates
				sandboxNS = sandboxNS.substring(sandboxNS.indexOf(config.structure.templates));
				splitPath = sandboxNS.split(path.sep);
				if (splitPath.indexOf(config.structure.templates) > -1) {
					// Remove internal structure path
					splitPath.splice(splitPath.indexOf(config.structure.templates), 1);
				}
				// Reset to basename
				splitPath[splitPath.length - 1] = path.basename(fp, ext);
				splitPath.unshift(this.TEMPLATE_CACHE_KEY_PREFIX);
				// Build id from path parts
				id = splitPath.join('__');

				timer = config.timer();
				try {
					compiled = dust.compile(fs.readFileSync(fp, 'utf8'), id);
					dust.loadSource(compiled);
				} catch (err) {
					config.log.error('Compilation error: ' + err.message + ' in ' + fp);
				}
				timer('Compiling ' + fp + ' as ' + id);
			}
		},

		// Just used for testing?
		compilePaths: function (paths) {
			const self = this;
			if (typeof paths === 'string') {
				paths = [].slice.call(arguments, 0);
			}
			paths.forEach(function (name) {
				if (fs.existsSync(name)) {
					self.compileFile(name);
				} else {
					config.log.info('Could not find template ' + name);
				}
			});
		},

		compileTemplates: function (forTests) {
			let fullFiles = [];
			// Get all defined modules templates first (in order defined by the host app)
			config.modules.forEach(function (module) {
				const moduleResourcesPath = (forTests) ? forTests : path.join(hostAppDir, 'node_modules', module);
				// Must use / for glob even with windows
				const templates = [moduleResourcesPath, config.structure.templates, '**', ('*' + config.structure.templateExt)].join('/');
				fullFiles = fullFiles.concat(glob.sync(templates, {}));
			});
			// Then get the app's templates
			// (must use / for glob even with windows)
			const templates = [hostAppDir, config.structure.templates, '**', ('*' + config.structure.templateExt)].join('/');
			fullFiles = fullFiles.concat(glob.sync(templates, {}));
			this.compileFileList(fullFiles);
		},

		compileOnDemand: function (name) {
			const self = this;
			const localPath = path.join(config.structure.templates, name.split('__').join(path.sep) + config.structure.templateExt);
			config.modules.map(function (module) {
				return path.join(hostAppDir, 'node_modules', module, localPath);
			}).concat([
				path.join(hostAppDir, localPath)
			]).filter(function (file) {
				return fs.existsSync(file);
			}).forEach(function (file) {
				self.compileFile(file);
			});
		},

		// Accepts an array of files with full paths, sends each to compile
		compileFileList: function (fileArr) {
			const self = this;
			fileArr.forEach(function (file) {
				self.compileFile(file);
			});
		},

		watchTemplates: function () {
			let watchTree;
			let watcher;
			let folders = [config.structure.templates];
			let self = this;

			const compile = function (fp) {
				self.compileFile(fp);
			};

			modulesPaths.forEach(function (mp) {
				folders.push(path.join(mp, config.structure.templates));
			});
			watchTree = require('./watcher')(config.structure.templateExt).watchTree;
			watcher = watchTree(folders, config.log);
			watcher.on('fileModified', compile);
			watcher.on('fileCreated', compile);
			config.log.debug('Watching ' + folders.join(', ') + ' for changes');
		},

		watchDustExtensions: function () {
			let watchTree;
			let watcher;
			let folders = [config.path.dust];
			let self = this;

			const compile = function (fp) {
				config.log.info('Loading Dust extension ' + fp);
				delete require.cache[require.resolve(fp)];
				require(fp)(dust, self, config);
			};

			modulesPaths.forEach(function (mp) {
				folders.push(path.join(mp, config.structure.dust));
			});
			watchTree = require('./watcher')('.js').watchTree;
			watcher = watchTree(folders, config.log);
			watcher.on('fileModified', compile);
			watcher.on('fileCreated', compile);
			config.log.debug('Watching ' + folders.join(', ') + ' for changes');
		},

		render: function (req, res, data, callback) {
			const name = (data && data.layout && data.layout.template) ? data.layout.template : 'layout';
			this.renderPartial(name, req, res, data, callback);
		},

		renderPartial: function (partial, req, res, data, callback) {
			inputFilters.run(req, res, data, function (data) {
				const ns = (data && data.layout && data.layout.namespace) ? data.layout.namespace : null;
				const base = dust.makeBase({
					namespace: ns
				}, {
					namespace: ns
				});
				dust.render(partial, base.push(data), function (err, out) {
					callback(err, out);
				});
			});
		}
	};
};
