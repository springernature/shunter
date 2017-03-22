
Configuration Reference
=======================

The config object passed to an instance of Shunter can append or overwrite Shunter's default configuration. The default configuration options are documented below with some information on how to define and organise the configuration of a Shunter application.

- [Web](#web-configuration)
- [Path](#path-configuration)
- [Structure](#structure-configuration)
- [Log](#log-configuration)
- [StatsD](#statsd-configuration)
- [Timer](#timer-configuration)
- [JSON View Parameter](#json-view-parameter)
- [Environment](#environment-configuration)
- [Templated Error Pages](#templated-error-page-configuration)
- [Custom Configurations](#adding-custom-configurations)
- [Configuring Modules](#configuring-modules)
- [Command Line Options](#command-line-options)


Web Configuration
-----------------

The web object contains the names of directory for serving private and public resources compiled by Shunter on build. It also contains the name of the directory where tests are located:

```js
web: {
    public: '/public',
    publicResources: '/public/resources',
    resources: '/resources',
    tests: '/tests'
}
```


Path Configuration
------------------

The path object defines the paths to some of the key directories used by Shunter. This includes the application root path, paths to tests, themes and public resources:

```js
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

```js
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

- `structure.templates` defines the location of the templates used to render the Shunter application's output. By default the value of this is 'view'.

- `structure.templateExt` defines the file extension that Shunter should use for templating. By default this is .dust as Dust is the default templating in use within Shunter.

- `structure.resources` defines the name of the directory used to house front-end resources including CSS, JavaScript and images, the default value is 'resources'.

- `structure.styles` defines the name of the directory used to hold CSS files used in your Shunter application. The default value is 'css'.

- `structure.images` defines the directory used to hold image files used for presentation. This default value is 'img'.

- `structure.scripts` defines the directory used to hold JavaScript files.

- `structure.fonts` defines the directory used to hold web fonts.

- `structure.tests` defines the directory used to hold the files that define your JavaScript and template tests.

- `structure.filters` defines the directory used to hold the filter functions that can be used to process JSON before and after it is rendered into to its output format.

- `structure.filtersInput` defines the directory used to hold the filter functions that can be used to process JSON before it is rendered into its output format.

- `structure.filtersOutput` defines the directory used to hold the filter functions that can be used to process output files once they has been rendered.


Log Configuration
-----------------

The log object defines the tool that Shunter should use for logging. By default Shunter uses [Winston](https://github.com/winstonjs/winston).

You can specify the logging level to use (e.g. 'info' the default, or 'debug' if you'd like to see more) by using the `-l` [command line option](#command-line-options)

```js
log: new winston.Logger({
    transports: [
        new (winston.transports.Console)({
            colorize: true,
            timestamp: true,
            level: args.logging
        })
    ]
}),
```

StatsD Configuration
--------------------

The `statsd` option defines the configuration used for the StatsD network daemon used for collecting metrics for graphing.


Timer Configuration
-------------------

the timer object defines a method used to append a date and time to messages passed to the log. By default it looks like this:

```js
timer: function() {
    var start = Date.now();
    return function(msg) {
        var diff = Date.now() - start;
        config.log.info(msg + ' - ' + diff + 'ms');
        return diff;
    };
},
```


JSON View Parameter
-------------------

Sometimes it's helpful to view the raw JSON that's being returned by the server. Shunter supports viewing this by using a query parameter. If this parameter is present, then the raw JSON will be output when a page is requested.

By default the query parameter is disabled so that nobody can look at your JSON if they know you use Shunter. You can enable it with the `jsonViewParameter` configuration.

This config property sets the name of the query parameter that triggers raw JSON serving:

```js
shunter({
    jsonViewParameter: 'show-me-the-json'
});
```

With the above configuration, you'd just need to append a query parameter to your URL:

```
/path/to/your/page?show-me-the-json=true
```


Environment Configuration
-------------------------

The `env` object contains functions that return the name of the different environments which your Shunter application may be deployed. By default it looks like this:

```js
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

You may like to modify this config object to reflect the environments to which you will be deploying your Shunter application.


Templated Error Page Configuration
----------------------------------

Optionally, you may require Shunter to render error pages for recoverable Shunter errors, and also 400/500 responses from the backend.  To do so, provide a configuration object similar to this:

```js
errorPages: {
    errorLayouts: {
        default: 'layout',
        404: 'layout-error-404'
    },
    staticData: {
        yourData: 'goesHere'
    }
}
```

The value of `errorPages.errorLayouts.default` should be the name of the root template you wish to use to render any error pages.  It is possible to override this default by HTTP Status Code — so in the example above `layout-error-404.dust` would be used as the root template if a 404 error is passed to Shunter from the backend.

Any data in `errorPages.staticData` will be made available under `staticData` in the root of the context when the page is rendered.

Additionally, when using templated error pages, Shunter will automatically insert the error object and some other information into the context for use in your templates.  Here is an example of the context object passed to the renderer in the event of a 404 error, given the above configuration:

```js
layout: {
    template: 'layout-error-404',
    namespace: 'custom-errors'
},
errorContext: {
    error: {
        status: 404,
        message: 'Not found'
    },
    hostname: 'localhost.localdomain',
    isDevelopment: true,
    isProduction: false,
    reqHost: 'localhost:5400',
    reqUrl: '/does-not-exist'
},
staticData: {
    yourData: 'goesHere'
}
```

If you need a large set of `staticData`, maybe consider a Custom Configuration?


Adding Custom Configurations
----------------------------

The items above are the default configurations which may be over-ridden. You will probably need to define some configuration that is unique to your own Shunter application. These can be neatly organized as JSON files in a config directory and required by your Shunter application at start-up to either append or overwrite existing configs. In the example below the `routes.json` usually required by Shunter has been placed in a `routes.json` file in the config directory and required from that location:

```js
var app = shunter({
    routes: require('./config/routes.json'),
    statsd: require('./config/statsd.json'),
    syslogAppName: 'my-shunter-app',
    path: {
        themes: __dirname
    }
});
```


Configuring Modules
-------------------

Shunter allows you to make use of a module format that lets you to do things like share common presentational features between a set of dependent apps. This allows you do things like manage shared assets and components in one place. As your dependent module may also contain config items this needs to be managed in a particular way. If you wish to use a module then place a file named `local.json` in your config directory containing the name of your module in the following format:

```json
{
    "modules": ["common-theme"]
}
```


Command Line Options
--------------------

Several aspects of Shunter behaviour can be configured via command line arguments when you start your application.

 * `-p`, `--port` Sets the port number Shunter will listen on, defaults to 5400.
 * `-m`, `--max-post-size` Sets the maximum size in bytes for the Shunter API, defaults to 204800.
 * `-c`, `--max-child-processes` When Shunter runs it spawns child worker processes to handle requests, this option sets the maximum number of child processes it will create. It defaults to 10, but will never exceed the number of CPU cores you have available.
 * `-r`, `--route-config` Sets the name of the default route, see [Routing](routing.md#route-config-options) for more details. Defaults to default.
 * `-l`, `--logging` Sets the logging level for your configured logger (e.g. 'error', 'warn', 'info', 'debug').  Defaults to 'info'.
 * `-s`, `--syslog` Turns on logging to syslog. Boolean.
 * `-d`, `--source-directory` Sets the root directory for your app, paths will be resolved from here. This setting is useful if you don't want to start your Shunter app from it's own directory. Defaults to the current working directory.
 * `-o`, `--route-override` Sets the proxy destination for all requests see [Routing](routing.md#route-override) for more details.
 * `-g`, `--origin-override` Requires `--route-override`. Sets `changeOrigin: true` for the route set up via `--route-override`, see [Routing](routing.md#route-config-options) for more details.
 * `--rewrite-redirect` Sets `autoRewrite` option on the proxy, see the [Node HTTP Proxy documentation](https://github.com/nodejitsu/node-http-proxy#options) for more details.
 * `--rewrite-protocol` Sets the `protocolRewrite` option on the proxy, see the [Node HTTP Proxy documentation](https://github.com/nodejitsu/node-http-proxy#options) for more details.
 * `--compile-on-demand` Compiles templates on demand instead of at application start up, only recommended in development mode if you want to speed up the application's start time (e.g. to run automated tests).
 * `-v`, `--version` Prints the Shunter version number.
 * `-w`, `--preserve-whitespace` Preserves whitespace in HTML output.
 * `-h`, `--help` Prints help about these options.


---

Related:

- [Full API Documentation](index.md)
