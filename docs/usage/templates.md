
Templates
=========

View templates in Shunter are written in [Dust](http://www.dustjs.com/) and live in the `view` folder by default.

- [Specifying a Template](#specifying-a-template)
- [Dust Basics](#dust-basics)
- [Using partials](#using-partials)
- [Using layouts](#using-layouts)
- [Using template inheritance](#using-template-inheritance)
- [Built-In Dust Extensions](#built-in-dust-extensions)
- [Writing Dust Extensions](#writing-dust-extensions)


Specifying a Template
---------------------

When JSON is received from the back-end, Shunter will look for a `layout.template` property and attempt to render the matching Dust file. So with the following JSON:

```json
{
    "layout": {
        "template": "foo"
    }
}
```

Shunter will attempt to render the file `view/foo.dust`. This allows your back-end application to decide which template to render for a given page.

Templates cannot contain "/" characters in Shunter, instead if you need to reference a template in a subdirectory you should use double underscores. So with the following JSON:

```json
{
    "layout": {
        "template": "foo__bar"
    }
}
```

Shunter will attempt to render the file `view/foo/bar.dust`.


Dust Basics
-----------

Dust has all of the features you'd expect from a good templating language. We'll cover some basics here, but you should read the [Dust documentation](http://www.dustjs.com/) for more information.

### References

You can output properties from the back-end JSON simply by surrounding the property name in curly braces. So with the following JSON and Dust template:

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


Using Partials
--------------

Partials in Dust allow you to insert other Dust files into your template to create a page. This encourages code reuse, and smaller more maintainable templates.

Partials are subject to the same naming rules as templates when they're references in Dust files. You'll need to replace slashes with double underscores in order for Shunter to find them.

So with the following Dust templates:

```html
<!-- view/foo/bar.dust -->
Hello World!
```

```html
<!-- view/foo.dust -->
<p>{>foo__bar/}</p>
```

When `view/foo.dust` is rendered, it will produce the following output:

```html
<p>Hello World!</p>
```

Partials can also be referenced by using JSON properties. This is very powerful if you'd like your backend to have more control over the presentation. So with the following JSON and Dust template:

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


Using Layouts
-------------

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
```

```html
<!-- view/home.dust -->
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
```

```html
<!-- view/home.dust -->
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


Using Template Inheritance
--------------------------

TODO Should cover:
- How template inheritance works
- Link to the [Modules and Inheritance](modules.md) page


Built-In Dust Extensions
------------------------

TODO Should cover:
- The difference between helpers and filters
- That we include the [LinkedIn Dust Helpers](http://www.dustjs.com/guides/dust-helpers/)
- That we have some built-in Dust extensions of our own

### The `assetPath` Helper

TODO document the `assetPath` helper

### The `and` Helper

TODO document the `and` helper

### The `or` Helper

TODO document the `or` helper

### The `dateFormat` Helper

TODO document the `dateFormat` helper

### The `numberFormat` Helper

TODO document the `numberFormat` helper

### The `lower` Filter

TODO document the `lower` filter

### The `upper` Filter

TODO document the `upper` filter

### The `title` Filter

TODO document the `title` filter

### The `amp` Filter

TODO document the `amp` filter

### The `strip-tags` Filter

TODO document the `strip-tags` filter

### The `html` Filter

TODO document the `html` filter


Writing Dust Extensions
-----------------------

TODO Should cover:
- The anatomy of a Dust extension (in Shunter land)
- An example helper
- And example filter
- Point at the LinkedIn [Helper API](http://www.dustjs.com/docs/helper-api/) and [Filter API](http://www.dustjs.com/docs/filter-api/)


---

Related:

- [Full API Documentation](../usage.md)
