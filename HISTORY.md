
# History

## 4.10.0 (2017-07-17)
* Support template rendering in client side tests

## 4.9.0 (2017-06-28)

* Support a `--no-exit` flag so end-users of the test-client can view test output in the Mocha Test Runner

## 4.8.0 (2017-06-06)

* updates compile step to handle .scss Sass files.
* Removes some unused config files.
* Updates Snyk and fixes the organisation name.

## 4.7.1 (2017-05-31)

* Fixes #160 - ensure text/html Content Type is set if returning an HTML templated error page

## 4.7.0 (2017-05-16)

* Makes the syslog transport user-configurable for the first time
* Makes other winston logging transports & filters user-configurable
* Adds getConfig() API method enabling users to read the runtime config

## 4.6.2 (2017-05-11)

* Ensures Shunter logs errors if using recent templated error pages option

## 4.6.1 (2017-04-12)

* Update most dependencies and devDependencies to the latest major version.
* Some minor refactoring and cleanup.

## 4.6.0 (2017-03-24)

* Adds option facilitating templated error pages

## 4.5.0 (2017-03-13)

* Add a `--logging` option to allow for setting the logging level
* Move less critical log events from info level to debug

## 4.4.1 (2017-03-06)

* Upgrade `qs` to `6.4.0`. Fixes https://snyk.io/vuln/npm:qs:20170213
* Updates several dependencies that include the vulnerable `qs` package.
* Replace all package version numbers in the package.json with the standard form as per our new dependency management guidelines in the playbook: https://github.com/springernature/frontend-playbook/blob/master/practices/dependency-management.md#specifying-versions-of-dependencies
* Package.json cleanup

## 4.4.0 (2017-03-02)

* Better error reporting if the client side test runner fails
* Build the script under test with the full mincer environment from your app

## 4.3.0 (2017-02-15)

* Add a `--compile-on-demand` option to enable lazy compilation of dust templates

## 4.2.3 (2017-02-15)

* Set the charset as utf-8 in JSON view
* Documentation updates
* Tidy up Travis config

## 4.2.2 (2017-01-11)

* Remove nature specific code from error page

## 4.2.1 (2016-11-30)

* Require `ejs` 2.5.3 or greater. Fixes a high severity remote code execution vuln.
* Upgrade other dependencies. Fixes several `npm install` warnings.

## 4.2.0 (2016-11-10)

* Pass the original host through to the backend in an `X-Orig-Host` header when using `changeOrigin`/`--origin-override`

## 4.1.3 (2016-11-03)

* Re-release due to error in previous release

## 4.1.2 (2016-11-03)

* Update dependency in module with reported security issues
    * wd: `~0.4` to `~1.0`

## 4.1.1 (2016-11-02)

* More gracefully handle errors if something is already running on the same port as shunter

## 4.1.0 (2016-10-24)

* Add CSS content-type mapping for dust-generated CSS files

## 4.0.2 (2016-09-30)

* Added `--preserve-whitespace` configuration flag to preserve whitespace in HTML output
* Update dependencies
    * dustjs-linkedin: `~2.7` to `>=2.7.4`
    * gaze: `~1.0` to `~1.1`

## 4.0.1 (2016-07-28)

* Correct Node.js support documentation and CI config
* Update dependencies
    * async: `~1.4` to `~2.0`
    * gaze: `~0.5` to `~1.0`

## 4.0.0 (2016-07-27)

* Drop support for Node.js < 4.x
* Add support for Node.js 6
* Remove the command line option `--deploy-timestamp-header`, which is now the default behaviour
* Remove deprecated content-type `x-shunter-json`
* Remove the following deprecated command line option aliases
    * `--sourcedirectory` for `--source-directory`
    * `--routeoveride` for `--route-override`
    * `--originoveride` for `--origin-override`
* Update dependencies
    * body-parser: `~1.14` to `~1.15`
    * cheerio: `~0.19` to `~0.20`
    * csswring: `~3.0` to `~5.1`
    * ejs: `0.8.3` to `~2.5`
    * glob: `~5.0` to `~7.0`
    * hasbin: `~1.1` to `~1.2`
    * http-proxy: `~1.12` to `~1.14`
    * jserve: `~1.2` to `~2.0`
    * mincer: `~1.3` to `~1.4`
    * mocha-phantomjs-core: `~1.1` to `~1.3`
    * postcss: `~4.1` to `~5.1`
    * qs: `~3.1` to `~6.2`
    * request: `~2.67` to `~2.74`
    * saucelabs: `~0.1` to `~1.2`
    * serve-static: `~1.10` to `~1.11`
    * uglify-js: `~2.6` to `~2.7`
    * wd: `~0.3` to `~0.4`

## 3.8.3 (2016-07-22)

* Fixed missing url parameter in `classifiedTiming` calls

## 3.8.2 (2016-07-22)

* Allow the proxy timing metrics to be classified by page type

## 3.8.1 (2016-07-14)

* Fixed a bug where multibyte characters could get corrupted if they fell across multiple chunks of the backend response

## 3.8.0 (2016-07-11)

* Added `--deploy-timestamp-header` configuration flag to proxy the last deploy timestamp to the backend in a header `X-Shunter-Deploy-Timestamp` instead of a `shunter` query parameter

## 3.7.0 (2016-04-20)

* Added `--rewrite-redirect` and `--rewrite-protocol` configuration flags to allow the `autoRewrite` and `protocolRewrite` options to be set on node-http-proxy

## 3.6.0 (2016-03-14)

* More comprehensive route override mapping
    * Fix bug where setting a hostname with a protocol would fallback to the default config
    * Use url.parse() for more robust route mapping
    * Surface the protocol for future use in shunter

## 3.5.0 (2016-03-10)

* The following command line options have been aliased, the original names are deprecated and will be removed in the next major version
    * `--sourcedirectory` as `--source-directory`
    * `--routeoveride` as `--route-override`
    * `--originoveride` as `--origin-override`
* Exit on start up and display the `--help` message if an unknown option is provided

## 3.4.0 (2016-02-23)

* Don't explicitly proxy to port 80 if no port is specified in the route

## 3.3.3 (2016-02-09)

* Update repository references to springernature
* Update the license
* Fix some typos in the documentation

## 3.3.2 (2016-02-05)

* Refactor the query module into a new library

## 3.3.1 (2016-02-03)

* Re-release due to rogue files in npm publish

## 3.3.0 (2016-02-03)

* Add `--originoveride` option
* Simplify language on 'testing' page
* Fix jshint linting errors
* Better document the `--sourcedirectory` flag
* Add sciam to the list of shunter sites

## 3.2.0 (2015-12-01)

* Add the ability to mount additional middleware before proxying
* Standardise the history file

## 3.1.1 (2015-11-27)

* Update dependencies
    * http-proxy: `~1.11` to `~1.12`
    * request: `~2.64` to `~2.67`
    * uglify-js: `~2.4` to `~2.6`
    * yargs: `~3.26` to `~3.30`
* Clarify the versioning documentation
* Codify our support plan for older versions of Shunter

## 3.1.0 (2015-11-24)

* Add custom X-Shunter header to proxied requests https://github.com/springernature/shunter/issues/86

## 3.0.2 (2015-11-17)

* Run linters on CI under Node.js 0.12
* Fix incorrect path in the getting started guide - thanks [Jorge Epuñan](https://github.com/juanbrujo)

## 3.0.1 (2015-11-11)

* Update the documentation

## 3.0.0 (2015-11-10)

* Regex now have to be explicitly indentified in `routes.json` by delimiting them with `/` characters

## 2.2.0 (2015-11-09)

* Add a `trim` filter to trim leading and trailing whitespace from a Dust reference

## 2.1.4 (2015-11-09)

* Add support for Node.js 5.x

## 2.1.3 (2015-10-29)

* Fix JSHint errors in creation of worker processes

## 2.1.2 (2015-10-14)

* Fix a bug that was causing async Dust helpers to fail

## 2.1.1 (2015-10-09)

* Fix loading of Mincer extensions

## 2.1.0 (2015-10-07)

* Add support for apps to load Mincer extensions
* Add documentation for the [`good-starter-issue` label](https://github.com/springernature/shunter/labels/good-starter-issue)

## 2.0.0 (2015-09-29)

* Add support for Node.js 4.x
* Add the ability to view raw JSON with a query parameter
* Change the ordering or EJS helper parameters
* Replace jsdom with Cheerio
* Remove the PhantomJS install from the dependencies
* Remove Base64-encoding of images in the CSS
* Remove automatic `rem` conversion in the CSS
* Update dependencies
    * body-parser: `~1.13` to `~1.14`
    * cookie-parser: `~1.3` to `~1.4`
    * jserve: `~1.1` to `~1.2`
    * request: `~2.62` to `~2.64`
    * yargs: `~3.25` to `~3.26`

## 1.0.1 (2015-09-23)

* Update the documentation

## 1.0.0 (2015-09-22)

* Document modules
* Add a sprauncy logo
* Initial public release

## 0.3.0 (2015-09-21)

* Changed StatsD client to fix an incompatibility with some versions of Node.js 0.12

## 0.2.1 (2015-09-18)

* Replace `dust.helpers.tap` with `context.resolve` (see https://github.com/linkedin/dustjs-helpers/wiki/Deprecated-Features#tap)
* Document Dust helpers, testing, input filters, and output filters
* License under LGPL 3.0
* Update dependencies
    * mocha-phantomjs: `~3.5` to `~3.6`
    * request: `~2.61` to `~2.62`
    * yargs: `~3.15` to `~3.25`

## 0.2.0 (2015-09-08)

* Document configuration and template tests
* Replace the built-in json-serve script with JServe
* Downgrade the "template not found" error to a warning

## 0.1.1 (2015-09-04)

* Fix Travis encrypted config after repo rename

## 0.1.0 (2015-09-04)

* Initial release
