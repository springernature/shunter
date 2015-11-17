---
title: Resources - Shunter Documentation
layout: docs
docpath: /usage/resources.html
docversion: 2.2.0
docbaseurl: /docs/2.2.0
---

Resources
=========

- [Resource Basics](#resource-basics)
- [Writing CSS](#writing-css)
- [Writing JavaScript](#writing-javascript)
- [Adding Images](#adding-images)
- [Other Static Assets](#other-static-assets)
- [Built-In EJS Extensions](#built-in-ejs-extensions)
- [Writing EJS Extensions](#writing-ejs-extensions)
- [In Production](#production-differences)


Resource Basics
---------------

Shunter uses [Mincer](http://nodeca.github.io/mincer/) to compile and serve assets required by the front end such as CSS, JavaScript and image files. In the case of JavaScript and CSS, dependent files can be required from within a single file that will then be referenced within a layout template. Mincer makes use of [EJS templating](http://www.embeddedjs.com/) to manage requiring of resource files.

Mincer takes a load path and handles every file it finds within that directory. Mincer creates a logical path for each asset, and bases its logical path on the relative folder structure to the load path. In production mode, Mincer will reference a manifest file to match these logical paths to fingerprinted file names.

Note: if two assets are loaded that have the same logical path, the first one in 'wins'. This is important if you are using modules to load in extra resources and templates.

For example if a module you were using were to have `resources/css/foo.css`, it would result in the logical path 'foo.css'. However, when the resources for your host app are loaded in and it also has `resources/css/foo.css`, this too will be given the logical path 'foo.css' and because the asset path for your host app is loaded first, it 'wins'. This can be useful for deliberately overriding, but if you wanted both files then your host apps file would need to be different, e.g. foo_ext.css. For more information on how inheritance works see the [Modules and Inheritance](modules.html) page.


Writing CSS
-----------

By default CSS files should be placed in a directory named `css` within a resources directory in the root of your Shunter application. The location of the resources and CSS directory can be modified by overiding the defaults in the config object. 

You might want to set up a `main.css.ejs` in `resources/css` to act as your manifest file. It will require your other internal stylesheets and set some defaults. If you are including modules with CSS files in them, you could refer to them here.

CSS files can be included in your layout template by using the Dust assetPath helper. This helper will determine the location of your file according to the type of file that it is and retrieve it from the location specified in your config files. By default this helper will look for CSS files in the `resources/css` directory so the following would create a path to `main.css` residing in the `resources/css` folder:

{% highlight html %}
<link rel="stylesheet" href="{@assetPath src="main.css"/}"/>
{% endhighlight %} 

Further CSS files may be required from within a CSS file in the following way:

{% highlight css %}
/*
 *= require bootstrap.css
 */
{% endhighlight %}

If you would like to recursively include an entire directory of CSS files you may use the 'require_tree' directive. eg:

{% highlight css %}
/*
 *= require_tree components
 */
{% endhighlight %}


Writing Javascript
------------------

You should set up `main.js.ejs` in `resources/js` within the root of your Shunter application JavaScript files should be placed here. The location of the resources and JavaScript directory can be modified by overiding the defaults in the config object.

Javascript files can be included in your layout template by using the Dust assetPath helper. This helper will determine the location of your file according to the type of file that it is and retrieve it from the location specified in your config files. By default this helper will look for JavaScript files in the `resources/js` directory so the following would create a path to `main.js` residing in the `resources/js` folder:

{% highlight html %}
<script src="{@assetPath src="main.js"/}"></script>
{% endhighlight %} 

Further JavaScript files may be required from within a JavaScript file by doing the following:

{% highlight js %}
//= require jquery-1.9.1.js
//= require components/forms.js
{% endhighlight %}

If you would like to recursively include an entire directory of JavaScript files you may use the 'require_tree' directive. eg:

{% highlight js %}
//= require_tree components
{% endhighlight %}


Adding Images
-------------

Images can also be included using the assetPath helper. Image files should be placed in a directory named img within a `resources` directory in the root of your Shunter application. The location of the resources and img directory can be modified by overiding the defaults in the config object.

{% highlight css %}
background-image: url(<%= asset_path('icons/png/icon-login-25x25-white.png') %>);
{% endhighlight %}

{% highlight html %}
<img src="{@assetPath src="myimg.png"}" alt="" />
{% endhighlight %}


Other Static Assets
-------------------

Static assets are possible, but you should only use these when you are unable to utilise Mincer (e.g. html emails, 500 error page).

By default, assets in the `public` subdirectory are served on the path `public`.

If it isn't convenient to have one or both of these as 'public' you can override them by setting the config option in your `local.json` file using `config.path.public` for where the assets are saved and `config.web.public` for the path that you would like to serve them on.


Built In EJS Extensions
-----------------------

Mincer uses an [EJS](https://www.npmjs.com/package/ejs) engine for pre-processing assets within resource files. Assets to be included must therefore include the `.ejs` suffix 

Shunter uses an implementation of the Mincer [assetPath helper](http://nodeca.github.io/mincer/#assetPath) that is distinct from Shunter's [Dust `assetPath` helper](templates.html#the-assetpath-helper). It behaves in a similar way and this is what you would use to return paths to assets in a CSS file, for example:

{% highlight css %}
#logo {
    background: url(<%= asset_path('logo.png') %>);
}
{% endhighlight %}


Writing EJS Extensions
----------------------

You can write your own EJS helpers to assist with the processing of CSS and JavaScript. Custom EJS extensions should sit in a directory named `ejs` within your Shunter application.

EJS helper files must export a single function which is called with the Mincer environment, manifest and Shunter config object.

An example helper might look like the following, which outputs the current year:

{% highlight js %}
// <app>/ejs/current-year.js
module.exports = function(environment, manifest, config) {
    environment.registerHelper('currentYear', function() {
        var date = new Date();
        return date.getFullYear();
    });
};
{% endhighlight %}


Production Differences
----------------------

Shunter provides a build script that will do the following things for a production environemt:

* Concatenate and minify CSS and JavaScript
* Write static files to `public/resources` with MD5-fingerprinted file names for cache invalidation
* Create a `manifest.json` file that maps the logical names for resources to their actual fingerprinted file names

To run the build script:

{% highlight sh %}
./node_modules/.bin/shunter-build
{% endhighlight %}

After this script has run, you should see that the  `public` directory in your project has a resources subfolder, with all your compiled assets present.

To run Shunter in production mode (and use the built resources):

{% highlight sh %}
NODE_ENV=production node app.js
{% endhighlight %}


---

Related:

- [Full API Documentation](index.html)
