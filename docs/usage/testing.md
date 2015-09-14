
Testing
=======

TODO Should cover:
- Basics of testing
- Don't be preachy, just explain that we've included some helpers


Testing Templates
-----------------

As dust templates can contain logic, there will be scenarios where you want to test that your code behaves as expected.

In your test spec, you need to load in the test helper from shunter, as you will need some of shunter's features to render the templates for testing.

Other dependencies are up to you. We use [Mocha](https://mochajs.org/), but you can use whatever you want.

```js
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
        }, function(error, dom, output) {
            var $ = dom.$;
            assert.strictEqual($('[data-test="fooitem"]').length, 1);
            done();
        });
    });
```

When testing templates that are in subfolders, be sure to pass in any subfolders in the same way that you'd include a partial

```js
helper.render('mysubfolder___templatename', {
    foo: 'bar'
}, function(error, dom, output) {
    // etc etc
});
```

You can test individual templates by running mocha directly with the command:

```
./node_modules/mocha/bin/mocha -R spec -u bdd test/myfolders/mytemplate-spec.js
```


Testing Client-Side JavaScript
------------------------------



Shunter provides a command-line script that will:

* build up a Mocha test runner page that loads in your JavaScript under test with Mincer, and any test specification files in the 'client' subfolder of the folder named in config.path.tests (by default, 'tests')
* run your tests with output to the console
* exit to the command line with an exit code of 0 for success and a positive integer for failure so that you can run on CI



This means your code under test is loaded in the same way it would be when running the app in development mode

Options
-------
-------

* Test just one spec file
  * `./node_modules/.bin/shunter-test-client --spec file-spec`
* Test in browsers with Saucelabs
  * `./node_modules/.bin/shunter-test-client --browsers`
* Add a resource module to the JavaScript under test (modules in your config automatically added)
  * `./node_modules/.bin/shunter-test-client --resource-module foo`

TODO Should cover:
- Using the test-client CLI (Reference `./node_modules/.bin/shunter-test-client`, not `test-client.js`)
- The libraries used in test-client ([Mocha](https://mochajs.org/), [Proclaim](https://github.com/rowanmanning/proclaim))
- Example tests (don't be specific about the directory, maybe just add this in `tests` for now and note that you can organise your tests in any way you like)


---

Related:

- [Full API Documentation](../usage.md)
