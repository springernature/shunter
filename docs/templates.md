# Templates

View templates in Shunter are written in [Dust](http://www.dustjs.com/) and live in the `view` folder by default.

* [Specifying a Template](#specifying-a-template)
* [Dust Basics](#dust-basics)
  * [References](#references)
  * [Conditionals](#conditionals)
  * [Loops](#loops)
* [Using Partials](#using-partials)
* [Using Layouts](#using-layouts)
  * [Layouts In JSON](#layouts-in-json)
  * [Layouts With Dust Blocks](#layouts-with-dust-blocks)
* [Built-In Dust Extensions](#built-in-dust-extensions)
  * [The `assetPath` Helper](#the-assetpath-helper)
  * [The `linkPath` Helper](#the-linkpath-helper)
  * [The `and` Helper](#the-and-helper)
  * [The `or` Helper](#the-or-helper)
  * [The `dateFormat` Helper](#the-dateformat-helper)
  * [The `numberFormat` Helper](#the-numberformat-helper)
  * [The `lower` Filter](#the-lower-filter)
  * [The `upper` Filter](#the-upper-filter)
  * [The `title` Filter](#the-title-filter)
  * [The `trim` Filter](#the-trim-filter)
  * [The `amp` Filter](#the-amp-filter)
  * [The `stripTags` Filter](#the-striptags-filter)
  * [The `html` Filter](#the-html-filter)
* [Writing Dust Extensions](#writing-dust-extensions)

## Specifying a Template

When a JSON response is received from the back end with the (configured trigger header)[configuration-reference.md#trigger-parameter] (default: `Content-Type: application/x-shunter+json`), Shunter will look for a `layout.template` property and attempt to render the matching Dust file. So with the following JSON:

```json
{
	"layout": {
		"template": "foo"
	}
}
```

Shunter will attempt to render the file `view/foo.dust`. This allows your back end application to decide which template to render for a given page.

Templates cannot contain "/" characters in Shunter, instead if you need to reference a template in a subdirectory you should use double underscores. So with the following JSON:

```json
{
	"layout": {
		"template": "foo__bar"
	}
}
```

Shunter will attempt to render the file `view/foo/bar.dust`.

If a JSON response is received without the (configured trigger header)[configuration-reference.md#trigger-parameter] then Shunter will simply pass it through unmodified as it would any other resource.

## Dust Basics

Dust has all of the features you'd expect from a good templating language. We'll cover some basics here, but you should read the [Dust documentation](http://www.dustjs.com/) for more information.

### References

You can output properties from the back end JSON simply by surrounding the property name in curly braces. So with the following JSON and Dust template:

```json
{
	"thing": "World"
}
```

```html
<p>Hello {thing}!</p>
```

Dust will render:

```html
<p>Hello World!</p>
```

### Conditionals

You can conditionally output HTML based on the values of JSON properties. So with the following JSON and Dust template:

```json
{
	"show_html": true
}
```

```html
{?show_html}
	<p>Hello World!</p>
{/show_html}
```

Dust will render:

```html
<p>Hello World!</p>
```

### Loops

You can loop over arrays in the JSON with Dust and generate output for each item in the array. So with the following JSON and Dust template:

```json
{
	"list": [
		"foo",
		"bar",
		"baz"
	]
}
```

```html
<ul>
	{#list}
		<li>{.}</li>
	{/list}
</ul>
```

Dust will render:

```html
<ul>
	<li>foo</li>
	<li>bar</li>
	<li>baz</li>
</ul>
```

For more information on Dust, refer to the [Dust getting started documentation](http://www.dustjs.com/guides/getting-started/).

## Using Partials

Partials in Dust allow you to insert other Dust files into your template to create a page. This encourages code reuse, and smaller more maintainable templates.

Partials are subject to the same naming rules as templates when they're references in Dust files. You'll need to replace slashes with double underscores in order for Shunter to find them.

So with the following Dust templates:

```html
<!-* view/foo/bar.dust -->
Hello World!
```

```html
<!-* view/foo.dust -->
<p>{>foo__bar/}</p>
```

When `view/foo.dust` is rendered, it will produce the following output:

```html
<p>Hello World!</p>
```

Partials can also be referenced by using JSON properties. This is very powerful if you'd like your back end to have more control over the presentation. So with the following JSON and Dust template:

```json
{
	"foo": "bar"
}
```

```html
{>"{foo}"/}
```

The `view/bar.dust` partial will be rendered.

For more information on partials in Dust partials, refer to the [Dust Partials documentation](http://www.dustjs.com/guides/partials/).

## Using Layouts

There are several ways to implement layouts in Shunter, either by allowing your JSON to configure them or by using Dust's built-in Blocks.

### Layouts In JSON

Because partials can be referenced using JSON properties, you could create layouts by using a single `layout` view and injecting a second template into the body of it.

For example, given the following JSON and Dust templates:

```json
{
	"layout": {
		"template": "layout",
		"page_template": "home"
	},
	"title": "Hello World!"
}
```

```html
<!-* view/layout.dust -->
<!DOCTYPE html>
<html lang="en">
<head>
	<title>{title}</title>
</head>
<body>
	{>"{layout.page_template}"/}
</body>
</html>
```

```html
<!-* view/home.dust -->
<p>This is the home page!</p>
```

Dust will combine the templates and render:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<title>Hello World!</title>
</head>
<body>
	<p>This is the home page!</p>
</body>
</html>
```

### Layouts With Dust Blocks

Dust has a feature called [Blocks and Inline Partials](http://www.dustjs.com/guides/blocks/) which is very powerful. It allows you to create templates which extend each other, and inject content into templates further up the chain.

We can utilise this for layouts quite easily, and without any need to add extra layout properties to the JSON.

For example, given the following JSON and Dust templates:

```json
{
	"layout": {
		"template": "home"
	},
	"title": "Hello World!"
}
```

```html
<!-* view/layout.dust -->
<!DOCTYPE html>
<html lang="en">
<head>
	<title>{title}</title>
</head>
<body>
	{+bodyContent/}
</body>
</html>
```

```html
<!-* view/home.dust -->
{>"layout"/}

{<bodyContent}
	<p>This is the home page!</p>
{/bodyContent}
```

Dust will combine the templates and render:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<title>Hello World!</title>
</head>
<body>
	<p>This is the home page!</p>
</body>
</html>
```

## Built-In Dust Extensions

For when basic logic isn't enough, you can use helpers and filters to extend Dust. Although templates should ideally contain as little logic as possible, sometimes you can't get away from it.

Dust helpers can run on a block of HTML:

```html
{@helper}HTML to run the helper on{/helper}
```

Or by themselves to output content:

```html
{@helper/}
```

They are also configurable with parameters:

```html
{@helper param="value"/}
```

Filters are different – they operate on existing values:

```html
{myProperty|filter}
```

Filters are chainable:

```html
{myProperty|filter1|filter2}
```

Shunter includes the full set of [officially supported Dust helpers](http://www.dustjs.com/guides/dust-helpers/). These add a lot of power to the language.

As well as including the official helpers and filters, Shunter comes bundled with some additional ones:

### The `assetPath` Helper

The `assetPath` helper is used to output the correct paths to MD5-fingerprinted assets. It's required for your application to run in production.

`assetPath` accepts a `src` parameter which should be set to the non-fingerprinted path:

```html
<link rel="stylesheet" href="{@assetPath src="main.css"/}"/>
```

### The `linkPath` Helper

The `linkPath` helper is used to create a url considering the mount-path

example:

```html
<form action="{@linkPath src="/search" /}" method="post">
```

with mount-path `/mounty` it will produce `/mounty/search`

### The `and` Helper

The `and` helper is used to check whether several properties are all truthy. It accepts a `keys` parameter which should be a pipe-separated list of properties to check. If all of them are truthy, the helper block will be output:

```html
{@and keys="foo|bar"}
	Output if `foo` and `bar` are both truthy
{/and}
```

The `and` helper supports an `{:else}` block:

```html
{@and keys="foo|bar"}
	Output if `foo` and `bar` are both truthy
{:else}
	Output if either `foo` or `bar` are falsy
{/and}
```

Also if the `not` parameter is `true`, the behaviour of the helper is inverted:

```html
{@and keys="foo|bar" not=true}
	Output if `foo` and `bar` are both falsy
{/and}
```

### The `or` Helper

The `or` helper is used to check whether one of the given properties are truthy. It accepts a `keys` parameter which should be a pipe-separated list of properties to check. If at least one of them is truthy, the helper block will be output:

```html
{@or keys="foo|bar"}
	Output if either `foo` or `bar` are truthy
{/or}
```

The `or` helper supports an `{:else}` block:

```html
{@or keys="foo|bar"}
	Output if either `foo` or `bar` are truthy
{:else}
	Output if `foo` and `bar` are both falsy
{/or}
```

Also if the `not` parameter is `true`, the `or` helper will render the block if at least one of the properties is _falsy_:

```html
{@or keys="foo|bar" not=true}
	Output if either `foo` or `bar` are falsy
{/or}
```

### The `dateFormat` Helper

The `dateFormat` helper is used to format dates. It accepts two parameters: `date` and `format`. The `date` parameter expects a date string, and the `format` should be a formatting string supported by the [node-dateformat library](https://github.com/felixge/node-dateformat):

```html
{@dateFormat date="2015-09-14" format="dd mmmm yyyy"/}
<!-* Outputs: "14 September 2015" -->
```

### The `numberFormat` Helper

The `numberFormat` helper is used to format numbers. It accepts a single parameter (`num`) and outputs the given number with thousands separators:

```html
{@numberFormat num="1000000"/}
<!-* Outputs: "1,000,000" -->
```

### The `lower` Filter

The `lower` filter takes a property and lowercases the value. If `foo` is `Hello World`:

```html
{foo|lower}
<!-* Outputs: "hello world" -->
```

### The `upper` Filter

The `upper` filter takes a property and uppercases the value. If `foo` is `Hello World`:

```html
{foo|upper}
<!-* Outputs: "HELLO WORLD" -->
```

### The `title` Filter

The `title` filter takes a property and titlecases the value. If `foo` is `hello world`:

```html
{foo|title}
<!-* Outputs: "Hello World" -->
```

### The `trim` Filter

The `trim` filter takes a property and strips leading and trailing whitespace from the value.  If `foo` is `\r\n \thello world\n`:

```html
{foo|trim}
<!-* Outputs: "hello world" -->
```

### The `amp` Filter

The `amp` filter replaces ampersands in a property with HTML entities, but ignores ampersands that are the opening for an existing entity. If `foo` is `Hello World & Everyone&hellip;`:

```html
{foo|amp}
<!-* Outputs: "Hello World &amp; Everyone&hellip;" -->
```

Note that the `&hellip;` has not been touched.

### The `stripTags` Filter

The `stripTags` filter strips HTML open/close tags from a string. If `foo` is `<p>Hello <i>World</i></p>`:

```html
{foo|stripTags}
<!-* Outputs: "Hello World" -->
```

### The `html` Filter

The `html` filter encodes HTML special characters `<>&"'` as HTML entities. It will also ignore ampersands that are the opening for an existing entity, in the same way as the `amp` filter. If `foo` is `Hello <i>World</i> & "Everyone"`:

```html
{foo|html}
<!-* Outputs: "Hello &#60;i&#62;World&#60;/i&#62; &amp; &#34;Everyone&#34;" -->
```

## Writing Dust Extensions

It's also possible to write your own Dust helpers and filters to use in your Shunter application. Dust extensions live in the `dust` directory of your application and must export a single function:

```js
module.exports = function(dust) {
	// `dust.helpers` = an object to add helpers to
	// `dust.filters` = an object to add filters to
};
```

An example helper might look like the following, which outputs the current year:

```js
// <app>/dust/current-year.js
module.exports = function(dust) {
    dust.helpers.currentYear = function(chunk) {
        var date = new Date();
        return chunk.write(date.getFullYear());
    };
};
```

An example filter might look like the following, which reverses a string and outputs it:

```js
// <app>/dust/reverse.js
module.exports = function(dust) {
    dust.filters.reverse = function(value) {
        return value.split('').reverse().join('');
    };
};
```

Dust helpers and filters can also access the Shunter renderer and config objects by accepting more arguments in the exported function:

```js
module.exports = function(dust, renderer, config) {
    // `renderer` = the Shunter renderer object
    // `config`   = the Shunter application configuration
};
```

Dust has excellent documentation on how to write both [helpers](http://www.dustjs.com/docs/helper-api/) and [filters](http://www.dustjs.com/docs/filter-api/). You should follow these guides if you want to learn how to write helpers that leverage parameters and blocks.
