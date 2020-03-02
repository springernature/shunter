# Modules and Inheritance

Shunter can pull in common resources, filters, helpers and templates from one or more declared npm modules.  These modules are loaded in as dependencies via `package.json` and the application is made aware of them by configuration options set in `config/local.json`.

These dependencies can be overridden if there are files of the same name in your application.

* [Set-up Steps](#set-up-steps)
* [Config](#config)
* [Overriding shared code](#overriding-shared-code)
* [Developing with your module](#developing-with-your-module)
* [Testing your code](#testing-your-code)

## Set-up Steps

1. Set up your shared code with the same structures as you have for your main app, e.g. templates are put into a `view` folder, JavaScript goes into a `resources/js` folder, etc.
2. In your application's `package.json`, add your sharing module to dependencies, e.g.
```js
"dependencies": {
	"shunter": "^1",
	"my-shared-module": "~1.0"
},
```
3. Add the module name to `config/local.json`, e.g.
```json
{
	"modules": ["my-shared-module"]
}
```
4. Run `npm install` to install your dependencies.

## Config

When Shunter sets up configuration, it looks in your app's folders for `config/local.json` and extends the default config options object with the object found in the `local.json` file.

If there is a `modules` property with an array with one or more item in it, this is used within Shunter to find the relevant directory under `node_modules` and from there to load in Dust templates and helpers, add the resources files to the asset handler load path, and apply filters.

## Overriding shared code

If your shared code module and your app have a file of the same name, Shunter will pick the file in your app over the one in your shared code module.

For example, if you have both `my-shared-module/resources/css/forms.css` and `my-app/resources/css/forms.css`, CSS in the `my-shared-module` version will not be loaded into the compiled `main.css` file.

## Developing with your module

You can use [`npm link`](https://docs.npmjs.com/cli/link) to instruct npm to point your shunter application to your locally checked-out module code.

## Testing your code

You can run tests on your code in the same way as you do for your application.

The module should include Shunter as a _dev dependency_ so that the rendering helper is available (see [Testing](testing.md)).
