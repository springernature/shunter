#Tests - server

Tests are written with the mocha framework, with Sinon and Mockery for stubbing, and Proclaim for assertions.

To test your templates, you can directly run mocha with this command
`./node_modules/mocha/bin/mocha -R spec -u bdd tests/server/templates --recursive`

Because you will need some features from shunter for rendering the dust templates, you will need to load in the test helper from shunter.  Your resulting test file should look like this:


```js
'use strict';
var assert = require('proclaim'),
	rootdir = __dirname.substring(0, __dirname.indexOf('/tests/')),
	helper = require('shunter').testhelper();

describe('Foo bar', function() {
	before(function() {
		helper.setup(rootdir + '/view/template.dust', rootdir + '/view/subdir/template.dust');
	});
	after(helper.teardown);

	it('Should do something', function(done) {
		helper.render('template', {
			'foo': 'bar',
			'lorem': 'ipsum'
		}, function(err, dom, out) {
			var $ = dom.$;
			assert.strictEqual($('[data-test="fooitem"]').length, 1);
			done();
		});
	});
```

When testing templates that are in subfolders, be sure to pass in any subfolders in the same way that you'd include a partial
```
helper.render('mysubfolder___templatename', {
  "foo": "bar"
  }, function(err, dom, out) { etc etc });
```
