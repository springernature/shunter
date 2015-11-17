---
title: Modules and Inheritance - Shunter Documentation
layout: docs
docpath: /usage/modules.html
docversion: 2.1.4
docbaseurl: /docs/2.1.4
---

Modules and Inheritance
=======================

At Springer Nature, we have a lot of code that we need to share between different applications.  To do that, we enabled Shunter to pull in common resources, filters, helpers and templates from one or more declared npm modules.  These modules are loaded in as dependencies via `package.json` and the application is made aware of them by configuration options set in `config/local.json`.

In this way, shared code rollout can be controlled through versioning, which reduces the risk of regressions.

Code loaded in through modules can be overridden by your application simply by having a file of the same name in your application.

Set-up Steps
------------
1. Set up your shared code with the same structures as you have for your main app, e.g. templates are put into a `view` folder, JavaScript goes into a `resources/js` folder, etc.
1. In your application's `package.json`, add your sharing module to dependencies, e.g.
{% highlight js %}
"dependencies": {
	"shunter": "^1",
	"my-shared-module": "~1.0"
},
{% endhighlight %}
1. Add the module name to `config/local.json`, e.g.
{% highlight json %}
{
	"modules": ["my-shared-module"]
}
{% endhighlight %}
1. Run `npm install` to add in the code

Private Modules
---------------
We are using a private repository for versioned node modules so that we can use version ranges in `package.json` ([Gemfury](https://gemfury.com/)).

It isn't essential to use this - you can still use the other methods of setting your module location like GitHub urls.  However without a repository you are limited to pointing to one specific version.

Config
------
When Shunter sets up configuration, it looks in your app's folders for `config/local.json` and extends the default config options object with the object found in the `local.json` file.

If there is a `modules` property with an array with one or more item in it, this is used within Shunter to find the relevant directory under `node_modules` and from there to load in Dust templates and helpers, add the resources files to the asset handler load path, and apply filters.

Overriding shared code
------------------------------
If your shared code module and your app have a file of the same name, Shunter will pick the file in your app over the one in your shared code module.

E.g.
If you have both `my-shared-module/resources/css/forms.css` and `my-app/resources/css/forms.css`, CSS in the `my-shared-module` version will not be loaded into the compiled `main.css` file.

Developing with your module
---------------------------

Use NPM to point to your locally checked-out module code with [npm link](https://docs.npmjs.com/cli/link)

Testing your code
------------------------
You can run tests on your code in the same way as you do for your application.

The module's dev dependencies should include Shunter so that the rendering helper is available (see [Testing](testing.html))

---

Related:

- [Full API Documentation](index.html)
