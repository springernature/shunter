'use strict';

const path = require('path');
const eachModule = require('each-module');
const winston = require('winston');

module.exports = function (config) {
	const moduleLoadErrors = [];

	const getArrayOfValidModulesByDirName = function (finalDir) {
		let modules = [];
		const modulePusher = function (moduleName, moduleExports, file) {
			if (typeof moduleExports === 'function') {
				modules.push(moduleExports);
			} else {
				moduleLoadErrors.push('Invalid module dropped ' + file);
			}
		};

		// User-defined configurations take priority, but fallback to defaults if all seem invalid
		const locations = [config.path.root, config.path.shunterRoot]; // Config.path.root = users files
		for (let i = 0; i < locations.length; i++) {
			const localPath = path.join(locations[i], config.structure.logging, finalDir);
			eachModule(localPath, modulePusher);
			if (modules.length > 0) {
				break;
			}
		}
		return modules;
	};

	return {
		getLogger: function () {
			const validateTransports = function (arModules) {
				return arModules.map(function (fnModule) {
					return fnModule(config);
				}).filter(function (obModule) {
					return Boolean(obModule);
				});
			};

			const validateFilters = function (arModules) {
				return arModules.filter(function (fnModule) {
					return typeof fnModule('debug', 'a message') === 'string';
				});
			};

			const transports = getArrayOfValidModulesByDirName(config.structure.loggingTransports);
			const filters = getArrayOfValidModulesByDirName(config.structure.loggingFilters);

			const loggerInstance = new winston.Logger({
				transports: validateTransports(transports),
				filters: validateFilters(filters)
			});

			moduleLoadErrors.forEach(function (err) {
				loggerInstance.error(err);
			});

			return loggerInstance;
		}
	};
};
