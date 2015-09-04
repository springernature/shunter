
Configuration Reference
=======================


The config object passed to an instance of Shunter can append or overwrite Shunter's default configuration object. 
The default configuration options are documented below with some information on how to define and organise the configuration of a Shunter app.


Web Configuration
------------------

The web object contains the names of directory for serving private and public resources compiled by Shunter on build. It also contains the name of the directory where tests are located:

```javascript
web: {
	public: '/public',
	publicResources: '/public/resources',
	resources: '/resources',
	tests: '/tests'
}
```

Path Configuration
------------------

The path object defines the paths to some of the key directories used by Shunter. This includes the app route, paths to tests, themes and public resources:


```javascript
path: {
	root: appRoot,
	shunterRoot: shunterRoot,
	themes: path.join(shunterRoot, 'themes'),
	templates: path.join(appRoot, 'view'),
	public: path.join(appRoot, 'public'),
	publicResources: path.join(appRoot, 'public', 'resources'),
	resources: path.join(appRoot, 'resources'),
	shunterResources: path.join(shunterRoot, 'resources'),
	tests: path.join(appRoot, 'tests'),
	dust: path.join(appRoot, 'dust')
}
```


Structure Configuration
-----------------------


The structure object defines the directory structure where Shunter's resources will reside:

```javascript
structure: {
	templates: 'view',
	templateExt: '.dust',
	resources: 'resources',
	styles: 'css',
	images: 'img',
	scripts: 'js',
	fonts: 'fonts',
	tests: 'tests',
	filters: 'filters',
	filtersInput: 'input',
	filtersOutput: 'output',
	dust: 'dust',
	ejs: 'ejs'
}
```

* `structure.templates` defines the location of the templates used to render the HTML returned by shunter. By default the value of this is 'view'

* `structure.templateExt` defines the file extension that Shunter should use for templating. By default this is .dust as Dust is the default templating in use within Shunter

* `structure.templateExt` defines the file extension that Shunter should use for templating. By default this is .dust as Dust is the default templating in use within Shunter

* `structure.resources` defines the name of the directory used to house front-end resources including css, javascript, font and images, the default here is resources

* `structure.resources` defines the name of the directory used to house front-end resources including css, javascript and images, the default value is 'resources'

* `structure.resources` defines the name of the directory used to house front-end resources including css, javascript and images, the default value is 'resources'

* `structure.styles` defines the name of the directory used to hold css files used in your shunter app. This default value is 'css'.

* `structure.styles` defines the name of the directory used to hold css files used in your shunter app. This default value is 'css'

* `structure.images` defines the directory used to hold image files used for presentation. This default value is ''.

* `structure.scripts` defines the directory used to hold javascript files

* `structure.fonts` defines the directory directory used to hold web fonts

* `structure.tests` defines the directory used to hold the files that define your javascript and template tests.

* `structure.filters` defines the directory used to hold the filter functions that can be used to process json before and after it is rendered into HTML.

* `structure.filtersInput` defines the directory used to hold the filter functions that can be used to process json before it is rendered into HTML.

* `structure.filtersOutput` defines the directory used to hold the filter functions that can be used to process HTML files once they has been rendered.




Log Configuration
-----------------



The log object defines the tool that Shunter should use for logging. By default Shunter uses [Winston](https://github.com/winstonjs/winston)

```javascript
log: new winston.Logger({
	transports: [
		new (winston.transports.Console)({
			colorize: true,
			timestamp: true
		})
	]
}),
```

Log Configuration
-----------------



- What each one does
- What the default is
- Differences between development/production
- How to organise your configuration nicely into files?


Statsd Configuration
--------------------


The `statsd` option defines the configuration used for the statsd network daemon used for collecting metrics for graphing. 


Statsd Configuration
--------------------


The `statsd` option defines the configuration used for the statsd network daemon used for collecting metrics for graphing. 

Timer Configuration
--------------------

the timer object defines method used to append a date and time to messages passed to the log. By default it looks like this:

```javascript
timer: function() {
	var start = Date.now();
	return function(msg) {
		var diff = Date.now() - start;
		config.log.info(msg + ' - ' + diff + 'ms');
		return diff;
	};
},
```
Environment Configuration
-------------------------

the `env` object contains functions that return the name of the different environments which your shunter application may be deployed. By default looks like this:

```javascript
env: {
	name: env,
	host: function() {
		return hostname;
	},
	isDevelopment: function() {
		return this.name === 'development';
	},
	isProduction: function() {
		return this.name === 'production';
	}
}
```
You may like to modify this config object to reflect the environments to which you will be deploying your Shunter app.


Adding Custom Configuration to your app
---------------------------------------

The items above are the default configurations which may be over-ridden. You will probably need to define some configuration that is unique to your own Shunter app. These can be neatly organized as json files in a config directory and required by your Shunter app at start-up to either append or overwrite existing configs. In the example below the routes.json usually required by Shunter has been palced in a route.json file in the config directory and required from that location:

```javascript
ar app = shunter({
    routes: require('./config/routes.json'),
    statsd: require('./config/statsd.json'),
    syslogAppName: 'my-shunter-app',
    path: {
        themes: __dirname
    }
});
```

Configuring Modules
---------------------------------------

Shunter allows you to make use of a module format that lets you to do things like share common presentational features between a set of dependent apps. This allows you do things like the manange of shared assets and components in one place. As your dependent module may also contain config items this needs to be managed in a particular way. If you wish to use a module then place a file named `local.json` in your config directory containing the name of your module in the following format:

```json
{
	"modules": ["common-theme"]
}	

```


---

Related:

- [Full API Documentation](../usage.md)
