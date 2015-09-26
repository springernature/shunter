#!/usr/bin/env node
/*
Test-client.js

Usage: node test-client
	spec defaults to null
	--spec myspec-name
		tests only 'myspec-name.js' instead of the entire suite
		will fail without exiting if cannot find it, so ok for recursive tests

	--browsers
		run the tests in actual browsers, via saucelabs
		requires sauceconnect, see https://docs.saucelabs.com/reference/sauce-connect/
		once sauceconnect is installed, you need to run it with:
		    bin/sc -u YOUR_USERNAME -k YOUR_ACCESS_KEY

	resource-module defaults to null
	--resource-module
		name of modules (e.g. shunter-mosaic) also required for resources to be complete
		shunter is not required in this list, it is always loaded
		any modules listed in your config file will automatically be loaded
		Can provide more than one
		e.g. node test-client --resource-module foo --resource-module bar

Purpose: run client-side javascript tests with mocha-phantomjs or saucelabs
Returns: exits with 0 for success and error code returned by mocha-phantomjs for failure, or 1 for other failures

Background:
mocha-phantomjs requires either a static html file or a url as a starting point for testing.
We have to compile the main js.ejs with Mincer file to get the various 'required' js files within it and get a js output.
We need a server running to serve Mincer-compiled output.
We need a dynamic template to output the right path for the main js file.

This script starts up a server, so you don't have to already have one running.
 - It will work regardless of whether you've already started shunter.
 - It should avoid race conditions of starting the main app and running the tests

 Created: 2014-03-04 v1

 See also:
 http://staal.io/blog/2013/08/17/incredibly-convenient-testing-of-frontend-javascript-with-node-dot-js/

 */

'use strict';

(function() {
	// jshint maxstatements: false
	// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

	var fs = require('fs');
	var path = require('path');
	var shell = require('child_process').exec; // used for triggering mocha-phantomjs. do not pass user input to this.
	var connect = require('connect');
	var serveStatic = require('serve-static');
	var Mincer = require('mincer');
	var dust = require('dustjs-linkedin');
	var yargs = require('yargs');
	var promise = require('promised-io/promise');
	var Deferred = promise.Deferred;
	var wd = require('wd');
	var cluster = require('cluster');
	var hasbin = require('hasbin');

	var argv = yargs
		.string('max-depth')
		.boolean('parents')
		.string('spec')
		.boolean('browsers')
		.string('resource-module')
		.alias('h', 'help')
		.help('help')
		.default({
			recursive: true,
			parents: true,
			spec: null,
			browsers: false,
			'resource-module': null
		})
		.describe({
			spec: 'Test a specific spec file',
			browsers: 'Test in actual browsers, requires SauceConnect',
			'resource-module': 'Additional resources module'
		})
		.argv;

	var config = require('../lib/config')(null, null, {});
	var jsDir = path.join(config.structure.resources, config.structure.scripts);

	var environment = getMincerEnvironment();
	var host = 'localhost';
	var port = 55001; // https://docs.saucelabs.com/reference/sauce-connect/#can-i-access-applications-on-localhost-
	var baseUri = 'http://' + host + ':' + port + '/';
	var urlRegex = new RegExp('^' + baseUri + '[\\w-/\\.]*$', 'i');
	var saucelabsUser = 'coin';
	var saucelabsKey = '86aed001-ddbe-4497-9497-10f948a51299';
	var saucelabs = new (require('saucelabs'))({
		username: saucelabsUser,
		password: saucelabsKey
	});
	var supportedBrowsers = {
		// For browser tests, we will run in two versions of each of the following browsers.
		// The latest version available and the lowest version >= the version listed below.
		// The versions below were chosen based on claimed grade-A support in the wiki:
		// http://powerplant.nature.com/wiki/display/JPCIS/Graded+Browser+Support
		chrome: 1,
		firefox: 2,
		'internet explorer': 8, // IE7 times out without managing to invoke any tests
		safari: 4.1
		// opera: 10, // Fails with java.lang.UnsupportedOperationException
		// iphone: 4.3, // Tests hang part-way through and eventually time out
		// android: 2.3 // Fails with java.lang.UnsupportedOperationException
	};
	var workerCount = 0;
	var aggregateExitCode = 0;

	if (cluster.isWorker) {
		return runTests();
	}

	// dust template setup
	var testfile = fs.readFileSync(__dirname + '/../view/test-runner.dust', 'utf8');
	dust.loadSource(dust.compile(testfile, 'testrunner'));
	// middleware
	var app = startApp();
	app.listen(port, runTests);

	/*
		set up the Mincer environment
		@returns Object environment for the Mincer instance
	*/
	function getMincerEnvironment() {
		// set up assets
		var environment = new Mincer.Environment();
		var resourceModules = getResourceModules();
		resourceModules.forEach(function(modname) {
			environment.appendPath(path.join('node_modules', modname, jsDir));
		});
		if (config.path.root !== config.path.shunterRoot) {
			environment.appendPath(path.join(config.path.shunterRoot, jsDir)); // always load core, as it holds things like jquery
		}
		environment.prependPath(path.join(config.path.root, jsDir));
		return environment;
	}


	function getResourceModules() {
		var resourceModules = config.modules || [];
		if (argv['resource-module']) {
			resourceModules = (
				Array.isArray(argv['resource-module']) ?
				argv['resource-module'] :
				[argv['resource-module']]
			);
		}
		return resourceModules;
	}

	/*
		Get script block for processed main.js file via Mincer
	*/
	dust.helpers.scriptBlock = function(chunk, context, bodies, params) {
		var assetPath;
		var asset = environment.findAsset(params.src);
		if (!asset) {
			die('Fatal error: missing main script asset', 1);
		}
		assetPath = path.join(config.structure.resources, asset.digestPath);
		return chunk.write('<script src="/' + assetPath + '"></script>');
	};

	/*
		Get the correct group of test files
	*/
	dust.helpers.scriptSpecs = function(chunk) {
		var testfolder = config.path.clientTests;
		var jsfiles = [];
		var scriptArr = [];

		if (argv.spec) { // if a spec file was specified, only use that. will throw non-fatal error if it doesn't exist
			jsfiles = [argv.spec + '.js'];
		} else if (fs.existsSync(testfolder)) {
			// get all the spec files, ensure folder exists before trying to read from it, otherwise we get a noent that fails the process
			jsfiles = fs.readdirSync(testfolder).filter(function(value) { // get only .js files
				return (path.extname(path.basename(value)) === '.js');
			});
		}
		jsfiles = jsfiles.map(function(value) { // get path for asset
			return path.join(testfolder, value);
		});
		scriptArr = jsfiles.map(function(value) {
			return '<script src="' + path.join(path.sep, path.relative(config.path.root, value)) + '"></script>';
		});
		return chunk.write(scriptArr.join('\n'));
	};

	/*
		Start up connect to serve Mincer middleware
		@returns Object connect instance
	*/
	function startApp() {
		var app = connect();
		app.use('/resources', Mincer.createServer(environment));
		app.use('/tests', serveStatic('tests'));
		app.use('/testslib', serveStatic(path.join(__dirname, '..', 'tests')));

		app.use(function(req, res) {
			if (req.url === '/') {
				dust.render('testrunner', {}, function(err, out) {
					res.setHeader('Content-Type', 'text/html');
					res.end(out);
				});
			} else {
				// may be obsolete, tbc with rest of team
				if (fs.exists(__dirname + req.url)) {
					fs.createReadStream(__dirname + req.url).pipe(res);
					console.log('stream');
				} else {
					res.writeHead(404, {'Content-Type': 'text/plain'});
					res.write('404 Not found');
					res.end();
				}
			}
		});
		return app;
	}

	/*
		Callback that runs the tests once the server is ready
	 */
	function runTests() {
		var urls = [baseUri];

		if (argv.browsers) {
			return saucelabs.getActiveTunnels(function(error, tunnels) {
				checkError(error);

				if (tunnels.length === 0) {
					die('Fatal error: no active tunnels', 1);
				}

				if (cluster.isMaster) {
					cluster.on('exit', onWorkerExit);
					return saucelabs.getWebDriverBrowsers(createBrowserWorkers);
				}

				runBrowserTests(urls, marshallBrowser(process.env.browserName, process.env.browserVersion));
			});
		}

		if (!hasbin.sync('phantomjs')) {
			die('The `phantomjs` binary was not found in PATH.\nPlease install PhantomJS http://phantomjs.org/', 1);
		}

		var testPromises = urls.map(function(url) {
			return testPromise(url);
		});
		var testResults = promise.all(testPromises);
		testResults.then(function(results) {
			var failures = results.filter(function(value) {
				return value > 0;
			});
			var exitCode = 0;
			var message = 'Finished';
			if (failures.length) {
				exitCode = failures[0]; // return first failure or 0
				message += ' ' + failures.length + ' failures';
			}
			die(message, exitCode);
		});
	}

	function onWorkerExit(worker, exitCode) {
		workerCount -= 1;
		aggregateExitCode += exitCode;

		if (workerCount === 0) {
			die('Finished', aggregateExitCode);
		}
	}

	function checkError(error) {
		if (error) {
			die('Fatal error: ' + error.message, 1);
		}
	}

	function createBrowserWorkers(error, browsers) {
		reduceBrowsers(null, error, browsers).forEach(createBrowserWorker);
	}

	function reduceBrowsers(targetBrowser, error, browsers) {
		checkError(error);

		if (targetBrowser) {
			return browsers.reduce(selectBrowser.bind(null, targetBrowser), null);
		}

		return concatReducedBrowsers(browsers.reduce(selectBrowsers, {}));
	}

	function selectBrowser(target, selected, candidate) {
		var name;
		var version;

		name = candidate.api_name;
		version = parseFloat(candidate.short_version);

		if (target.browserName !== name || target.version > version) {
			return selected;
		}

		if (!selected) {
			return candidate;
		}

		if (version < parseFloat(selected.short_version)) {
			return candidate;
		}

		return selected;
	}

	function selectBrowsers(selected, candidate) {
		// jshint maxcomplexity: 8

		var name;
		var version;
		var competitors;
		var oldVersion;
		var newVersion;

		name = candidate.api_name;
		version = parseFloat(candidate.short_version);

		if (!supportedBrowsers[name] || supportedBrowsers[name] > version) {
			return selected;
		}

		competitors = selected[name];

		if (!competitors) {
			selected[name] = [candidate];
			return selected;
		}

		oldVersion = parseFloat(competitors[0].short_version);

		if (competitors.length === 1) {
			if (version < oldVersion) {
				competitors.unshift(candidate);
			} else {
				competitors.push(candidate);
			}

			return selected;
		}

		newVersion = parseFloat(competitors[1].short_version);

		if (version < oldVersion) {
			competitors.shift();
			competitors.unshift(candidate);
			return selected;
		}

		if (version > newVersion) {
			competitors.pop();
			competitors.push(candidate);
		}

		return selected;
	}

	function concatReducedBrowsers(reducedBrowsers) {
		var result = [];

		Object.keys(reducedBrowsers).forEach(function(browser) {
			result = result.concat(reducedBrowsers[browser]);
		});

		return result;
	}

	function createBrowserWorker(browser) {
		var name;
		var version;
		var worker;

		name = browser.api_name;
		version = browser.short_version;

		worker = cluster.fork({
			browserName: name,
			browserVersion: version
		});
		workerCount += 1;

		console.log('Created worker process ' + worker.process.pid + ' for ' + name + ' ' + version);
	}

	function marshallBrowser(name, version) {
		return {
			browserName: name,
			version: version
		};
	}

	function runBrowserTests(urls, browser) {
		var count;
		var errors;
		var length;
		var browserName;
		var browserVersion;
		var sessionName;
		var driver;

		count = errors = 0;
		length = urls.length;
		browserName = browser.browserName;
		browserVersion = browser.version;
		browser.name = sessionName = browserName + ' ' + browserVersion;

		driver = wd.promiseRemote('ondemand.saucelabs.com', 80, saucelabsUser, saucelabsKey);
		driver.init(browser)
			.then(iterateTests)
			.fail(function() {
				console.log('Browser ' + sessionName + ' was not available');

				// SauceLabs' shitty API returns browsers that it doesn't support.
				// This hack retries progressively later versions of those browsers
				// until we find one that works or there are no more versions.
				var targetBrowser = {
					browserName: browserName,
					version: Math.floor(parseFloat(browserVersion) + 1)
				};

				saucelabs.getWebDriverBrowsers(retryTests.bind(null, targetBrowser));
			});

		function iterateTests() {
			var next;

			if (urls.length > 0) {
				next = urls.shift();
				driver.get(next)
					.then(runTest.bind(null, next))
					.fail(function(error) {
						finishTest(next, createErrorResult(error));
					});
			}
		}

		function createErrorResult(error) {
			return {
				failures: 1,
				failed: [
					{
						fullTitle: 'n/a',
						error: error
					}
				]
			};
		}

		function runTest(url) {
			driver.waitForConditionInBrowser('!!window.mochaResults', 30000)
				.then(driver.execute.bind(driver, 'return window.mochaResults', null))
				.then(finishTest.bind(null, url))
				.fail(function(error) {
					finishTest(url, createErrorResult(error));
				});
		}

		function finishTest(url, results) {
			var localDie;

			reportErrors(url, results.failed);

			count += 1;
			errors += results.failures;

			if (count === length) {
				localDie = die.bind(null, 'Finished ' + sessionName + ' tests' + formatErrors(errors), errors);

				driver.quit()
					.then(driver.sauceJobStatus.bind(driver, errors === 0))
					.then(localDie)
					.fail(function(error) {
						console.error('Error: ' + error.message);
						localDie();
					});
			}

			iterateTests(driver, browser);
		}

		function reportErrors(url, failures) {
			if (failures) {
				failures.forEach(function(failure) {
					console.error('Test failed in ' + sessionName);
					console.error('    URL: ' + url);
					console.error('    Test: ' + failure.fullTitle);
					console.error('    Error: ' + failure.error.message);
				});
			} else {
				console.log('All tests passed in ' + sessionName + ' for ' + url);
			}
		}

		function formatErrors(errorCount) {
			return ' (' + errorCount + ' error' + (errorCount === 1 ? ')' : 's)');
		}

		function retryTests(targetBrowser, error, browsers) {
			var newBrowser = reduceBrowsers(targetBrowser, error, browsers);

			if (!newBrowser) {
				die('Fatal error: Failed to get alternative browser to ' + sessionName);
			}

			console.log(
				'Attempting to use ' + newBrowser.api_name + ' ' + newBrowser.short_version +
				' as an alternative to ' + sessionName
			);

			runBrowserTests(urls, marshallBrowser(newBrowser.api_name, newBrowser.short_version));
		}
	}

	/*
		Run a test on a url
		NB: async function, using promises to return pass/fail code
		@param url {String} The url to be tested against mocha phantomjs
		@returns deferred promise object
	*/
	function testPromise(url) {
		var deferTest = new Deferred();
		var mochaPhantomJsPath = require.resolve('mocha-phantomjs-core');
		if (validUrl(url)) { // validate the string before we let it near the shell command
			shell('phantomjs ' + mochaPhantomJsPath + ' ' + url, function(err, stdin, stderr) {
				var exitCode = (err) ? err.code : 0;
				console.log(stdin); // always output the test results
				if (stderr) {
					console.error(stderr);
				}
				deferTest.resolve(exitCode);
				return deferTest.promise;
			});
			return deferTest;
		} else {
			die('Fatal error: invalid URL passed to mocha-phantomjs', 1);
		}
	}

	/*
		Check a string is a valid url and is the same as the url we've set within this test suite
		@param url {String}
		@returns Boolean did url pass the validation check?
	*/
	function validUrl(url) {
		return urlRegex.test(url);
	}

	/*
		Exit the process
		@param message {String} console message
		@param exitCode {Integer} exit code to pass back to the command line
	 */
	function die(message, exitCode) {
		var method = (exitCode === 0 ? 'log' : 'error');
		console[method](message);
		process.exit(exitCode);
	}
}());
