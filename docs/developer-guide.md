
Shunter Developer Guide
=======================

This guide is here to help new developers get started with developing Shunter itself. It will outline the structure of the application and some of the development practices we uphold.

If you're looking for information on how to _use_ Shunter, please see the [API Documentation](usage.md).

- [Application Structure](#application-structure)
- [Use of GitHub Issues](#issue-tracking)
- [Writing Unit Tests](#testing)
- [Static Analysis](#static-analysis)
- [Versioning](#versioning)


Application Structure
---------------------

TODO outline the files in the application and what each one's purpose is


Issue Tracking
--------------

We use [GitHub issues](https://github.com/nature/shunter/issues) to log bugs and feature requests. This is a great place to look if you're interested in working on Shunter.

If you're going to pick up a piece of work, check the comments to make sure nobody else has started on it. If you're going to do it, say so in the issue comments.

We use labels extensively to categorise issues, so you should be able to find something that suits your mood.

If you're logging a new bug or feature request, please be as descriptive as possible. Include steps to reproduce and a reduced test case if applicable.


Testing
-------

We maintain a fairly complete set of test suites for Shunter, and these get run on every pull-request and commit to master. It's useful to also run these locally when you're working on Shunter.

To run all the tests, you can use:

```
make test
```

To run all the tests and linters together (exactly as we run on CI), you can use:

```
make ci
```

If you're developing new features or refactoring, make sure that your code is covered by unit tests. The `tests` directory mirrors the directory structure of the main application so that it's clear where each test belongs.


Static Analysis
---------------

As well as unit testing, we also lint our JavaScript code with [JSHint](http://jshint.com/) and [JSCS](http://jscs.info/). This keeps everything consistent and readable.

To run the linters, you can use:

```
make lint
```


Versioning
----------

Most of the time, one of the core developers will decide when a release is ready to go out. You shouldn't take this upon yourself without discussing with the team.

Shunter is versioned with [semver](http://semver.org/). You should read through the semver documentation if you're versioning Shunter.

To publish a new version of Shunter:

- Switch to the `master` branch, version commits are the only commits that shouldn't be in a pull-request
- Increment either the major, minor, or patch version in [`package.json`](https://github.com/nature/shunter/blob/master/package.json). If you're unsure which, have a chat about it or re-read the semver docs
- Add an entry to [`HISTORY.md`](https://github.com/nature/shunter/blob/master/HISTORY.md) outlining the changes in the new version. Take your time, this log should be useful to developers building with Shunter
- Commit your changes with a message like "Version 1.2.3" – this helps people find version commits in the log
- Tag your newly created commit with the version number. E.g. `git tag 1.2.3`
- Push both the commit and the new tags to origin: `git push && git push --tags`. It's really important to push tags as well!
