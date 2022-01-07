# Testing

As dust templates can contain logic, there will be scenarios where you want to test that your code behaves as expected.

In your test spec, you need to load in the test helper from shunter, as you will need some of shunter's features to render the templates for testing.

Other dependencies are up to you. Shunter uses [Mocha](https://mochajs.org/) for testing, but you can use any other test runner.

An example client test could be as follows:

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
		}, function(error, $, output) {
			assert.strictEqual($('[data-test="fooitem"]').length, 1);
			done();
		});
	});
});
```

In the `helper.render` callback, the `$` parameter is a [Cheerio](https://github.com/cheeriojs/cheerio) instance which allows you to use jQuery-like functions to access the render output. The `output` parameter contains the full output as a string.

You can use the following syntax to pass extra arguments to the `render` function:

```js
helper.render(template, req, res, data, callback);
```

This could be useful in cases where you want to test request objects, like checking for custom headers or cookies.

When testing templates that are in subfolders, be sure to pass in any subfolders in the same way that you would include a partial:

```js
helper.render('mysubfolder___templatename', {
	foo: 'bar'
}, function(error, $, output) {
	// etc etc
});
```

You can test individual templates by running mocha directly with the command:

```shell
./node_modules/mocha/bin/mocha -R spec -u bdd test/myfolders/mytemplate-spec.js
```

In addition to these tests we recommend using [Dustmite](https://github.com/nature/dustmite) to lint your dust files and ensure that they are all syntactically valid.
