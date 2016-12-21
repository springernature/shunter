
# ![Shunter](docs/shunter-logo.png)

Shunter is a [Node.js][node] application built to read JSON and translate it into HTML.

It helps you create a decoupled front end which can serve traffic from one or more back end applications - great for use in multi-language, multi-disciplinary teams or just to make your project more flexible and future-proofed.

[![NPM version][shield-npm]][info-npm]
[![Node.js version support][shield-node]][info-node]
[![Build status][shield-build]][info-build]
[![Dependencies][shield-dependencies]][info-dependencies]
[![LGPL-3.0 licensed][shield-license]][info-license]

## Key Features
- Enforces decoupling of templates from underlying applications
- Enables multiple applications to use the same unified front end
- Makes full site redesigns or swapping out back end applications a doddle
- Completely technology-agnostic; if your application outputs JSON, it can work with Shunter
- Asset concatenation, minification, cache-busting, and other performance optimisations built-in
- Outputs any type of content you like, e.g. HTML, RSS, RDF
- Well-tested and supported, serving [Scientific American](http://www.scientificamerican.com) as well as [many](http://www.nature.com/npjscilearn/) [high-traffic](http://www.nature.com/srep) [sites](http://www.nature.com/search) across nature.com


Getting Started
---------------

If you're new to Shunter, we recommend starting with our [Introduction](docs/introduction.md) then diving into the [Getting Started Guide](docs/getting-started.md). This will teach you the basics, and how to create your first Shunter application.

You can also refer to the [API Documentation](docs/usage/index.md) for a full breakdown about how to work with Shunter.


Requirements
------------

Shunter requires [Node.js][node] 4.x–6.x, which should come with [npm][npm]. This should be easy to get running on Mac and Linux.

On Windows things are a bit more complicated due to the Shunter install process requiring a C compiler. Here are some useful links to help you:

- [node-gyp Visual Studio 2010 Setup][node-gyp-vs]
- [contextify – Specified platform toolset (v110) is not installed or invalid][contextify]


Support and Migration
---------------------

Shunter major versions are supported for 6 months after their last release. This means that patch-level changes will be added and bugs will be fixed. We maintain a [support guide](docs/support.md) which documents the major versions and their support levels.

If you'd like to know more about how we support our open source projects, including the full release process, check out our [support practices document](support).

If you're migrating between major versions of Shunter, we maintain a [migration guide](docs/migration/index.md) to help you.


Contributing
------------

We maintain a developer guide to help people get started with working on Shunter itself. It outlines the structure of the application and some of the development practices we uphold.

We'd love for you to contribute to Shunter, read the [developer guide](docs/developer-guide.md) and get in touch! We also label [issues that might be a good starting-point][starter-issues] for new developers to the project.


License
-------

Shunter is licensed under the [Lesser General Public License (LGPL-3.0)][info-license].  
Copyright &copy; 2015, Springer Nature



[contextify]: http://zxtech.wordpress.com/2013/02/20/contextify-specified-platform-toolset-v110-is-not-installed-or-invalid/
[node]: https://nodejs.org/
[node-gyp-vs]: https://github.com/TooTallNate/node-gyp/wiki/Visual-Studio-2010-Setup
[npm]: https://www.npmjs.com/
[starter-issues]: https://github.com/springernature/shunter/labels/good-starter-issue
[support]: https://github.com/springernature/frontend/blob/master/practices/open-source-support.md

[info-coverage]: https://coveralls.io/github/springernature/shunter
[info-dependencies]: https://gemnasium.com/springernature/shunter
[info-license]: LICENSE
[info-node]: package.json
[info-npm]: https://www.npmjs.com/package/shunter
[info-build]: https://travis-ci.org/springernature/shunter
[shield-coverage]: https://img.shields.io/coveralls/springernature/shunter.svg
[shield-dependencies]: https://img.shields.io/gemnasium/springernature/shunter.svg
[shield-license]: https://img.shields.io/badge/license-LGPL%203.0-blue.svg
[shield-node]: https://img.shields.io/badge/node.js%20support-4–6-brightgreen.svg
[shield-npm]: https://img.shields.io/npm/v/shunter.svg
[shield-build]: https://img.shields.io/travis/springernature/shunter/master.svg
