
'use strict';

// Watch a file tree for changes using Gaze
module.exports = function(extension) {

	var watchTree = function(directories, log) {
		var Gaze = require('gaze');
		var watchedDirs = (typeof directories === 'string') ? constructGlob(directories) : directories.map(constructGlob);
		var watcher = new Gaze(watchedDirs);
		watcher.on('added', function(path) {
			watcher.emit('fileCreated', path);
		});
		watcher.on('changed', function(path) {
			watcher.emit('fileModified', path);
		});
		watcher.on('error', log.error);
		return watcher;
	};

	var constructGlob = function(dirpath) {
		var glob = '/**/*' + extension;
		return dirpath + glob;
	};

	return {
		watchTree: watchTree
	};
};
