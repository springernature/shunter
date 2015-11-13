---
title: Testing - Shunter Documentation
layout: docs
docpath: /usage/testing.html
docversion: 2.0.0
---

Testing
=======

When writing unit tests for Shunter-based apps, there will be certain fixtures that require help from Shunter, such as rendering a HTML partial from a Dust template with dummy JSON input, or writing compiled JavaScript into a test runner.

[Testing Templates](#testing-templates) explains how to use Shunter's exported function `testhelper` that helps you set up and tear down HTML partials.

[Testing Client-Side JavaScript](testing-client-side-javascript) explains how to use the `shunter-test-client` script to run client-side unit tests from the command line.


Testing Templates
-----------------

As dust templates can contain logic, there will be scenarios where you want to test that your code behaves as expected.

In your test spec, you need to load in the test helper from shunter, as you will need some of shunter's features to render the templates for testing.

Other dependencies are up to you. We use [Mocha](https://mochajs.org/), but you can use whatever you want.

{% highlight js %}
var assert = require('assert');
var rootdir = __dirname.substring(0, __dirname.indexOf('/tests/'));
var helper = require('shunter').testhelper();

describe('Foo bar', function() {
    before(function() {
        helper.setup(rootdir + '/view/template.dust', rootdir + '/view/subdir/template.dust');
    });
    after(helper.teardown);

    it('Should do something', function(done) {
        helper.render('template', {
            foo: 'bar',
            lorem: 'ipsum'
        }, function(error, $, output) {
            assert.strictEqual($('[data-test="fooitem"]').length, 1);
            done();
        });
    });
{% endhighlight %}

In the `helper.render` callback, the `$` parameter is a [Cheerio](https://github.com/cheeriojs/cheerio) instance which allows you to use jQuery-like functions to access the render output. The `output` parameter contains the full output as a string.

When testing templates that are in subfolders, be sure to pass in any subfolders in the same way that you'd include a partial

{% highlight js %}
helper.render('mysubfolder___templatename', {
    foo: 'bar'
}, function(error, $, output) {
    // etc etc
});
{% endhighlight %}

You can test individual templates by running mocha directly with the command:

{% highlight sh %}
./node_modules/mocha/bin/mocha -R spec -u bdd test/myfolders/mytemplate-spec.js
{% endhighlight %}


Testing Client-Side JavaScript
------------------------------

Shunter provides a command-line script that will:

* build up a test runner page for Mocha-PhantomJS that loads in your JavaScript under test with Mincer, and adds any test specification files found in the folder set in `config.path.clientTests` (by default, 'tests/client'), and sets up the mocha libraries for client-side testing.
* run your tests with console output detailing whether they passed or failed.
* exit to the command line with an exit code of 0 for success and a positive integer for failure so that you can run on CI

This means your code under test is compiled and loaded in the same way it would be when running the app in development mode.

The script makes use of [mocha-phantomjs-core](https://github.com/nathanboktae/mocha-phantomjs-core), and the test runner page loads in [Proclaim](https://github.com/rowanmanning/proclaim) as an assertion library.

Before you can use the test runner, you'll need to [install PhantomJS](http://phantomjs.org/) separately.

You can run your client-side tests with the command:

{% highlight sh %}
./node_modules/.bin/shunter-test-client
{% endhighlight %}

### Optional Arguments ###

#### Test Just One Spec File ####

{% highlight sh %}
./node_modules/.bin/shunter-test-client --spec file-spec
{% endhighlight %}

#### Test In Browsers With Sauce Labs ####

Requires Sauce Connect, see https://docs.saucelabs.com/reference/sauce-connect/
Once Sauce Connect is installed, you need to run it with:

{% highlight sh %}
bin/sc -u YOUR_USERNAME -k YOUR_ACCESS_KEY
{% endhighlight %}

Then you can run the command:

{% highlight sh %}
./node_modules/.bin/shunter-test-client --browsers
{% endhighlight %}

#### Add A Resource Module ####
Add a resource module to the JavaScript under test (modules in your config automatically added)

{% highlight sh %}
./node_modules/.bin/shunter-test-client --resource-module foo
{% endhighlight %}


---

Related:

- [Full API Documentation](index.html)
