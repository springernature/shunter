---
title: Templates - Shunter Documentation
layout: docs
docpath: /usage/templates.html
docversion: 3.0.1
docbaseurl: /docs/latest
---

Templates
=========

View templates in Shunter are written in [Dust](http://www.dustjs.com/) and live in the `view` folder by default.

- [Specifying a Template](#specifying-a-template)
- [Dust Basics](#dust-basics)
- [Using partials](#using-partials)
- [Using layouts](#using-layouts)
- [Built-In Dust Extensions](#built-in-dust-extensions)
- [Writing Dust Extensions](#writing-dust-extensions)


Specifying a Template
---------------------

When JSON is received from the back-end, Shunter will look for a `layout.template` property and attempt to render the matching Dust file. So with the following JSON:

{% highlight json %}
{
    "layout": {
        "template": "foo"
    }
}
{% endhighlight %}

Shunter will attempt to render the file `view/foo.dust`. This allows your back-end application to decide which template to render for a given page.

Templates cannot contain "/" characters in Shunter, instead if you need to reference a template in a subdirectory you should use double underscores. So with the following JSON:

{% highlight json %}
{
    "layout": {
        "template": "foo__bar"
    }
}
{% endhighlight %}

Shunter will attempt to render the file `view/foo/bar.dust`.


Dust Basics
-----------

Dust has all of the features you'd expect from a good templating language. We'll cover some basics here, but you should read the [Dust documentation](http://www.dustjs.com/) for more information.

### References

You can output properties from the back-end JSON simply by surrounding the property name in curly braces. So with the following JSON and Dust template:

{% highlight json %}
{
    "thing": "World"
}
{% endhighlight %}

{% highlight html %}
<p>Hello {thing}!</p>
{% endhighlight %}

Dust will render:

{% highlight html %}
<p>Hello World!</p>
{% endhighlight %}

### Conditionals

You can conditionally output HTML based on the values of JSON properties. So with the following JSON and Dust template:

{% highlight json %}
{
    "show_html": true
}
{% endhighlight %}

{% highlight html %}
{?show_html}
    <p>Hello World!</p>
{/show_html}
{% endhighlight %}

Dust will render:

{% highlight html %}
<p>Hello World!</p>
{% endhighlight %}

### Loops

You can loop over arrays in the JSON with Dust and generate output for each item in the array. So with the following JSON and Dust template:

{% highlight json %}
{
    "list": [
        "foo",
        "bar",
        "baz"
    ]
}
{% endhighlight %}

{% highlight html %}
<ul>
    {#list}
        <li>{.}</li>
    {/list}
</ul>
{% endhighlight %}

Dust will render:

{% highlight html %}
<ul>
    <li>foo</li>
    <li>bar</li>
    <li>baz</li>
</ul>
{% endhighlight %}

For more information on Dust, refer to the [Dust getting started documentation](http://www.dustjs.com/guides/getting-started/).


Using Partials
--------------

Partials in Dust allow you to insert other Dust files into your template to create a page. This encourages code reuse, and smaller more maintainable templates.

Partials are subject to the same naming rules as templates when they're references in Dust files. You'll need to replace slashes with double underscores in order for Shunter to find them.

So with the following Dust templates:

{% highlight html %}
<!-- view/foo/bar.dust -->
Hello World!
{% endhighlight %}

{% highlight html %}
<!-- view/foo.dust -->
<p>{>foo__bar/}</p>
{% endhighlight %}

When `view/foo.dust` is rendered, it will produce the following output:

{% highlight html %}
<p>Hello World!</p>
{% endhighlight %}

Partials can also be referenced by using JSON properties. This is very powerful if you'd like your backend to have more control over the presentation. So with the following JSON and Dust template:

{% highlight json %}
{
    "foo": "bar"
}
{% endhighlight %}

{% highlight html %}
{>"{foo}"/}
{% endhighlight %}

The `view/bar.dust` partial will be rendered.

For more information on partials in Dust partials, refer to the [Dust Partials documentation](http://www.dustjs.com/guides/partials/).


Using Layouts
-------------

There are several ways to implement layouts in Shunter, either by allowing your JSON to configure them or by using Dust's built-in Blocks.

### Layouts In JSON

Because partials can be referenced using JSON properties, you could create layouts by using a single `layout` view and injecting a second template into the body of it.

For example, given the following JSON and Dust templates:

{% highlight json %}
{
    "layout": {
        "template": "layout",
        "page_template": "home"
    },
    "title": "Hello World!"
}
{% endhighlight %}

{% highlight html %}
<!-- view/layout.dust -->
<!DOCTYPE html>
<html lang="en">
<head>
    <title>{title}</title>
</head>
<body>
    {>"{layout.page_template}"/}
</body>
</html>
{% endhighlight %}

{% highlight html %}
<!-- view/home.dust -->
<p>This is the home page!</p>
{% endhighlight %}

Dust will combine the templates and render:

{% highlight html %}
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Hello World!</title>
</head>
<body>
    <p>This is the home page!</p>
</body>
</html>
{% endhighlight %}

### Layouts With Dust Blocks

Dust has a feature called [Blocks and Inline Partials](http://www.dustjs.com/guides/blocks/) which is very powerful. It allows you to create templates which extend each other, and inject content into templates further up the chain.

We can utilise this for layouts quite easily, and without any need to add extra layout properties to the JSON.

For example, given the following JSON and Dust templates:

{% highlight json %}
{
    "layout": {
        "template": "home"
    },
    "title": "Hello World!"
}
{% endhighlight %}

{% highlight html %}
<!-- view/layout.dust -->
<!DOCTYPE html>
<html lang="en">
<head>
    <title>{title}</title>
</head>
<body>
    {+bodyContent/}
</body>
</html>
{% endhighlight %}

{% highlight html %}
<!-- view/home.dust -->
{>"layout"/}

{<bodyContent}
    <p>This is the home page!</p>
{/bodyContent}
{% endhighlight %}

Dust will combine the templates and render:

{% highlight html %}
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Hello World!</title>
</head>
<body>
    <p>This is the home page!</p>
</body>
</html>
{% endhighlight %}


Built-In Dust Extensions
------------------------

For when basic logic isn't enough, you can use helpers and filters to extend Dust. Although templates should ideally contain as little logic as possible, sometimes you can't get away from it.

Dust helpers can run on a block of HTML:

{% highlight html %}
{@helper}HTML to run the helper on{/helper}
{% endhighlight %}

Or by themselves to output content:

{% highlight html %}
{@helper/}
{% endhighlight %}

They are also configurable with parameters:

{% highlight html %}
{@helper param="value"/}
{% endhighlight %}

Filters are different – they operate on existing values:

{% highlight html %}
{myProperty|filter}
{% endhighlight %}

Filters are chainable:

{% highlight html %}
{myProperty|filter1|filter2}
{% endhighlight %}

Shunter includes the full set of [officially supported Dust helpers](http://www.dustjs.com/guides/dust-helpers/). These add a lot of power to the language.

As well as including the official helpers and filters, Shunter comes bundled with some additional ones:

### The `assetPath` Helper

The `assetPath` helper is used to output the correct paths to MD5-fingerprinted assets. It's required for your application to run in production.

`assetPath` accepts a `src` parameter which should be set to the non-fingerprinted path:

{% highlight html %}
<link rel="stylesheet" href="{@assetPath src="main.css"/}"/>
{% endhighlight %}

### The `and` Helper

The `and` helper is used to check whether several properties are all truthy. It accepts a `keys` parameter which should be a pipe-separated list of properties to check. If all of them are truthy, the helper block will be output:

{% highlight html %}
{@and keys="foo|bar"}
    Output if `foo` and `bar` are both truthy
{/and}
{% endhighlight %}

The `and` helper supports an `{:else}` block:

{% highlight html %}
{@and keys="foo|bar"}
    Output if `foo` and `bar` are both truthy
{:else}
    Output if either `foo` or `bar` are falsy
{/and}
{% endhighlight %}

Also if the `not` parameter is `true`, the behaviour of the helper is inverted:

{% highlight html %}
{@and keys="foo|bar" not=true}
    Output if `foo` and `bar` are both falsy
{/and}
{% endhighlight %}

### The `or` Helper

The `or` helper is used to check whether one of the given properties are truthy. It accepts a `keys` parameter which should be a pipe-separated list of properties to check. If at least one of them is truthy, the helper block will be output:

{% highlight html %}
{@or keys="foo|bar"}
    Output if either `foo` or `bar` are truthy
{/or}
{% endhighlight %}

The `or` helper supports an `{:else}` block:

{% highlight html %}
{@or keys="foo|bar"}
    Output if either `foo` or `bar` are truthy
{:else}
    Output if `foo` and `bar` are both falsy
{/or}
{% endhighlight %}

Also if the `not` parameter is `true`, the `or` helper will render the block if at least one of the properties is _falsy_:

{% highlight html %}
{@or keys="foo|bar" not=true}
    Output if either `foo` or `bar` are falsy
{/or}
{% endhighlight %}

### The `dateFormat` Helper

The `dateFormat` helper is used to format dates. It accepts two parameters: `date` and `format`. The `date` parameter expects a date string, and the `format` should be a formatting string supported by the [node-dateformat library](https://github.com/felixge/node-dateformat):

{% highlight html %}
{@dateFormat date="2015-09-14" format="dd mmmm yyyy"/}
<!-- Outputs: "14 September 2015" -->
{% endhighlight %}

### The `numberFormat` Helper

The `numberFormat` helper is used to format numbers. It accepts a single parameter (`num`) and outputs the given number with thousands seperators:

{% highlight html %}
{@numberFormat num="1000000"/}
<!-- Outputs: "1,000,000" -->
{% endhighlight %}

### The `lower` Filter

The `lower` filter takes a property and lowercases the value. If `foo` is `Hello World`:

{% highlight html %}
{foo|lower}
<!-- Outputs: "hello world" -->
{% endhighlight %}

### The `upper` Filter

The `upper` filter takes a property and uppercases the value. If `foo` is `Hello World`:

{% highlight html %}
{foo|upper}
<!-- Outputs: "HELLO WORLD" -->
{% endhighlight %}

### The `title` Filter

The `title` filter takes a property and titlecases the value. If `foo` is `hello world`:

{% highlight html %}
{foo|title}
<!-- Outputs: "Hello World" -->
{% endhighlight %}

### The `trim` Filter

The `trim` filter takes a property and strips leading and trailing whitespace from the value.  If `foo` is `\r\n \thello world\n`:

{% highlight html %}
{foo|trim}
<!-- Outputs: "hello world" -->
{% endhighlight %}

### The `amp` Filter

The `amp` filter replaces ampersands in a property with HTML entities, but ignores ampersands that are the opening for an existing entity. If `foo` is `Hello World & Everyone&hellip;`:

{% highlight html %}
{foo|amp}
<!-- Outputs: "Hello World &amp; Everyone&hellip;" -->
{% endhighlight %}

Note that the `&hellip;` has not been touched.

### The `stripTags` Filter

The `stripTags` filter strips HTML open/close tags from a string. If `foo` is `<p>Hello <i>World</i></p>`:

{% highlight html %}
{foo|stripTags}
<!-- Outputs: "Hello World" -->
{% endhighlight %}

### The `html` Filter

The `html` filter encodes HTML special characters `<>&"'` as HTML entities. It will also ignore ampersands that are the opening for an existing entity, in the same way as the `amp` filter. If `foo` is `Hello <i>World</i> & "Everyone"`:

{% highlight html %}
{foo|html}
<!-- Outputs: "Hello &#60;i&#62;World&#60;/i&#62; &amp; &#34;Everyone&#34;" -->
{% endhighlight %}


Writing Dust Extensions
-----------------------

It's also possible to write your own Dust helpers and filters to use in your Shunter application. Dust extensions live in the `dust` directory of your application and must export a single function:

{% highlight js %}
module.exports = function(dust) {
    // `dust.helpers` = an object to add helpers to
    // `dust.filters` = an object to add filters to
};
{% endhighlight %}

An example helper might look like the following, which outputs the current year:

{% highlight js %}
// <app>/dust/current-year.js
module.exports = function(dust) {
    dust.helpers.currentYear = function(chunk) {
        var date = new Date();
        return chunk.write(date.getFullYear());
    };
};
{% endhighlight %}

An example filter might look like the following, which reverses a string and outputs it:

{% highlight js %}
// <app>/dust/reverse.js
module.exports = function(dust) {
    dust.filters.reverse = function(value) {
        return value.split('').reverse().join('');
    };
};
{% endhighlight %}

Dust helpers and filters can also access the Shunter renderer and config objects by accepting more arguments in the exported function:

{% highlight js %}
module.exports = function(dust, renderer, config) {
    // `renderer` = the Shunter renderer object
    // `config`   = the Shunter application configuration
};
{% endhighlight %}

Dust has excellent documentation on how to write both [helpers](http://www.dustjs.com/docs/helper-api/) and [filters](http://www.dustjs.com/docs/filter-api/). You should follow these guides if you want to learn how to write helpers that leverage parameters and blocks.


---

Related:

- [Full API Documentation](index.html)
