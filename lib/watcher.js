'use strict';

// Watch a file tree for changes using Gaze
module.exports = function (extension) {
	const constructGlob = function (dirpath) {
		const glob = '/**/*' + extension;
		return dirpath + glob;
	};

	const watchTree = function (directories, log) {
		const Gaze = require('gaze');
		const watchedDirs = (typeof directories === 'string') ? constructGlob(directories) : directories.map(constructGlob);
		const watcher = new Gaze(watchedDirs);

		watcher.on('added', function (path) {
			watcher.emit('fileCreated', path);
		});
		watcher.on('changed', function (path) {
			watcher.emit('fileModified', path);
		});
		watcher.on('error', log.error);

		return watcher;
	};

	return {
		watchTree: watchTree
	};
};
