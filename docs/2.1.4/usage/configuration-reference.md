---
title: Configuration Reference - Shunter Documentation
layout: docs
docpath: /usage/configuration-reference.html
docversion: 2.1.4
---

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
- [Custom Configurations](#adding-custom-configurations)
- [Configuring Modules](#configuring-modules)


Web Configuration
-----------------

The web object contains the names of directory for serving private and public resources compiled by Shunter on build. It also contains the name of the directory where tests are located:

{% highlight js %}
web: {
    public: '/public',
    publicResources: '/public/resources',
    resources: '/resources',
    tests: '/tests'
}
{% endhighlight %}


Path Configuration
------------------

The path object defines the paths to some of the key directories used by Shunter. This includes the application root path, paths to tests, themes and public resources:

{% highlight js %}
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
{% endhighlight %}


Structure Configuration
-----------------------

The structure object defines the directory structure where Shunter's resources will reside:

{% highlight js %}
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
{% endhighlight %}

- `structure.templates` defines the location of the templates used to render the Shunter application's output. By default the value of this is 'view'.

- `structure.templateExt` defines the file extension that Shunter should use for templating. By default this is .dust as Dust is the default templating in use within Shunter.

- `structure.resources` defines the name of the directory used to house front-end resources including CSS, JavaScript and images, the default value is 'resources'.

- `structure.styles` defines the name of the directory used to hold CSS files used in your Shunter application. The default value is 'css'.

- `structure.images` defines the directory used to hold image files used for presentation. This default value is 'img'.

- `structure.scripts` defines the directory used to hold JavaScript files.

- `structure.fonts` defines the directory directory used to hold web fonts.

- `structure.tests` defines the directory used to hold the files that define your JavaScript and template tests.

- `structure.filters` defines the directory used to hold the filter functions that can be used to process JSON before and after it is rendered into to its output format.

- `structure.filtersInput` defines the directory used to hold the filter functions that can be used to process JSON before it is rendered into its output format.

- `structure.filtersOutput` defines the directory used to hold the filter functions that can be used to process output files once they has been rendered.


Log Configuration
-----------------

The log object defines the tool that Shunter should use for logging. By default Shunter uses [Winston](https://github.com/winstonjs/winston).

{% highlight js %}
log: new winston.Logger({
    transports: [
        new (winston.transports.Console)({
            colorize: true,
            timestamp: true
        })
    ]
}),
{% endhighlight %}

StatsD Configuration
--------------------

The `statsd` option defines the configuration used for the StatsD network daemon used for collecting metrics for graphing.


Timer Configuration
-------------------

the timer object defines a method used to append a date and time to messages passed to the log. By default it looks like this:

{% highlight js %}
timer: function() {
    var start = Date.now();
    return function(msg) {
        var diff = Date.now() - start;
        config.log.info(msg + ' - ' + diff + 'ms');
        return diff;
    };
},
{% endhighlight %}


JSON View Parameter
-------------------

Sometimes it's helpful to view the raw JSON that's being returned by the server. Shunter supports viewing this by using a query parameter. If this parameter is present, then the raw JSON will be output when a page is requested.

By default the query parameter is disabled so that nobody can look at your JSON if they know you use Shunter. You can enable it with the `jsonViewParameter` configuration.

This config property sets the name of the query parameter that triggers raw JSON serving:

{% highlight js %}
shunter({
    jsonViewParameter: 'show-me-the-json'
});
{% endhighlight %}

With the above configuration, you'd just need to append a query parameter to your URL:

{% highlight sh %}
/path/to/your/page?show-me-the-json=true
{% endhighlight %}


Environment Configuration
-------------------------

the `env` object contains functions that return the name of the different environments which your Shunter application may be deployed. By default looks like this:

{% highlight js %}
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
{% endhighlight %}

You may like to modify this config object to reflect the environments to which you will be deploying your Shunter application.


Adding Custom Configurations
----------------------------

The items above are the default configurations which may be over-ridden. You will probably need to define some configuration that is unique to your own Shunter application. These can be neatly organized as JSON files in a config directory and required by your Shunter application at start-up to either append or overwrite existing configs. In the example below the `routes.json` usually required by Shunter has been palced in a `route.json` file in the config directory and required from that location:

{% highlight js %}
var app = shunter({
    routes: require('./config/routes.json'),
    statsd: require('./config/statsd.json'),
    syslogAppName: 'my-shunter-app',
    path: {
        themes: __dirname
    }
});
{% endhighlight %}


Configuring Modules
-------------------

Shunter allows you to make use of a module format that lets you to do things like share common presentational features between a set of dependent apps. This allows you do things like manage shared assets and components in one place. As your dependent module may also contain config items this needs to be managed in a particular way. If you wish to use a module then place a file named `local.json` in your config directory containing the name of your module in the following format:

{% highlight json %}
{
    "modules": ["common-theme"]
}
{% endhighlight %}


---

Related:

- [Full API Documentation](index.html)
