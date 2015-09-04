
Testing
=======

TODO Should cover:
- Basics of testing
- Don't be preachy, just explain that we've included some helpers


Testing Templates
-----------------
As dust templates can contain logic, there will be scenarios where you want to test that your code behaves as expected.

In your test spec, you need to load in the test helper from shunter, as you will need some of shunter's features to render the templates for testing.

Other dependencies are up to you. We use [Mocha](https://www.npmjs.com/package/mocha), but you can use whatever you want.

```javascript
'use strict';
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

```javascript
helper.render('mysubfolder___templatename', {
  "foo": "bar"
  }, function(err, dom, out) { etc etc });
```

You can test individual templates by running mocha directly with this command: `./node_modules/mocha/bin/mocha -R spec -u bdd test/myfolders/mytemplate-spec.js`


Testing Client-Side JavaScript
------------------------------

TODO Should cover:
- Using the test-client CLI (Reference `./node_modules/.bin/shunter-test-client`, not `test-client.js`)
- The libraries used in test-client ([Mocha](https://mochajs.org/), [Proclaim](https://github.com/rowanmanning/proclaim))
- Example tests (don't be specific about the directory, maybe just add this in `tests` for now and note that you can organise your tests in any way you like)


---

Related:

- [Full API Documentation](../usage.md)
