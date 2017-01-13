
Getting Started with Shunter
============================

This guide will introduce you to Shunter and teach you how to use it to put together a basic application. [API Documentation](usage/index.md) is also available if you need more detail.

This guide will not explain every feature of Shunter. Its aim is to get you up-and-running in as little time as possible.

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Basics](#basics)
- [Sample Data](#sample-data)
- [Templates](#templates)
- [Styling](#styling)
- [JavaScript](#javascript)

Introduction
------------

Looking to create a smart, flexible, and robustly decoupled front end?

Need a hand defining integration points between your front and back end applications?

Want to use the same unified front end across both your rails(/PHP/ASP/other) application, and your Wordpress-driven blog?

Shunter is for you.

Technically speaking Shunter runs your decoupled front end as a node.js server, acting as a reverse proxy in front of your back end application(s).  This can be deployed on the same or a different server from your other applications as you see fit (it's super lightweight).

![Shunter as a proxy](diagram.png)

When a request comes in from a user, it's proxied through to your back end application (or can use multiple back ends using some simple [routing logic](usage/routing.md)).  Any JSON response which is sent back with the special `Content-Type` `application/x-shunter+json` will be taken by Shunter and [transformed using Dust.js](usage/templates.md), while any other resource is transparently passed back through to the user.


Prerequisites
-------------

Before we begin, you'll need to have [Node.js](https://nodejs.org/) installed - Shunter requires Node.js 4.x–6.x.

You'll need to be comfortable with the command line, and have some basic knowledge of HTML, CSS, JavaScript, and templating.


Basics
------

We'll start by creating a `package.json` file in a new directory. We're just including Shunter for now:

```json
{
  "name": "getting-started-with-shunter",
  "version": "1.0.0",
  "main": "app.js",
  "dependencies": {
    "shunter": "*"
  }
}
```

(Please note: you should set a specific version of Shunter when preparing a real-world application.)

Now we can run `npm install` to install dependencies. Once the dependencies have installed, we'll start to flesh out our application.

Shunter has a configurable directory structure. For now, we'll use the defaults. Run the following:

```
mkdir -p data public resources/css resources/img resources/js view
```

This should create the following directories:

```
├── data
├── public
├── resources
│   ├── css
│   ├── img
│   └── js
└── view
```

Now we need to write the application itself. This is nice and simple; add the following to a new file named `app.js`:

```js
// Require in Shunter
var shunter = require('shunter');

// Create a Shunter application, passing in options
var app = shunter({

    // Configure the themes path to the current directory
    path: {
        themes: __dirname
    },

    // Configure the proxy route, this should point to
    // where your back end application runs
    routes: {
        localhost: {
            default: {
                host: '127.0.0.1',
                port: 5401
            }
        }
    }

});

// Start the application
app.start();
```

When we run this file using `node app.js`, you should see a bunch of logs ending with a message like this:

```
All child processes listening
```

If you open up [http://localhost:5400/](http://localhost:5400/) in your browser, you should see a blank page in your browser and get some error messages in your terminal window. That's because we haven't got a back end running yet.


Sample Data
-----------

For the purposes of testing, Shunter comes bundled with a simple application for [serving static JSON files](usage/sample-data.md). This allows you to create a mock back end application which your Shunter application can connect to.

In a new terminal window, run the following to start a sample back end:

```
./node_modules/.bin/shunter-serve
```

You should see a message like this:

```
JSON server listening on port 5401
```

Leave this running. Now if you re-run `node app.js` in your original terminal window and visit [http://localhost:5400/](http://localhost:5400/) you should see a nice blue page with some form fields!

We'll want to provide a sample JSON file that the Shunter application can proxy to. We create sample JSON files in the `data` folder. Add the following to `data/home.json`:

```json
{
    "layout": {
        "template": "home"
    },
    "title": "Hello World!",
    "list": [
        "foo",
        "bar",
        "baz"
    ]
}
```

Notice the `layout.template` property in the JSON we just created? That indicates the [Dust](http://www.dustjs.com/) template that should be used to render the page. If we open up [http://localhost:5400/home](http://localhost:5400/home) now, then you'll see an error in your terminal indicating that the "home" template can't be found.



Templates
---------

Let's create that missing "home" template. Add the following to `view/home.dust`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>{title}</title>
</head>
<body>
    <h1>{title}</h1>
    <p>Welcome to your first Shunter page!</p>
</body>
</html>
```

Note our use of `{title}`. This is a reference to the `title` property in our JSON file.

Now restart your Shunter application again and open up [http://localhost:5400/home](http://localhost:5400/home) in your browser. You should see your rendered page.

[Dust](http://www.dustjs.com/) templating is very powerful, right now we're using the absolute basics. But we can add a basic Dust loop using the following:

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

Once you've finished this guide, you can learn more about [layouts](usage/templates.md#using-layouts) and [partials](usage/templates.md#using-partials).

Next we'll add some styles.


Styling
-------

Shunter's resources are managed through [Mincer](http://nodeca.github.io/mincer/), which adds in asset fingerprinting, concatenation, and minification.

CSS and JavaScript files in Shunter are actually run through the EJS templating language which gives us some useful helpers. These will come into play when we're adding a stylesheet.

Add the following to `resources/css/main.css.ejs`:

```css
body {
    font-family: Arial, Helvetica, sans-serif;
    text-align: center;
    color: #004f8b;
    background-color: #e0f1ff;
}
```

We'll also need to link to our stylesheet from `view/home.dust`:

```html
<link rel="stylesheet" href="{@assetPath src="main.css"/}"/>
```

Notice the `assetPath` helper we used? This is required for Shunter to load the MD5-fingerprinted file. If you don't add this, assets will load in development mode but not in production. You can [read more about the `assetPath` helper here](usage/templates.md#the-assetpath-helper).

Now refresh your page in-browser. Your page should be a lovely shade of blue!


JavaScript
----------

Add the following to `resources/js/main.js.ejs`:

```js
document.body.style.backgroundColor = randomValue([
    '#fadbd1',
    '#e1f3c8',
    '#b6dff2'
]);

function randomValue(array) {
    return array[randomBetween(0, array.length - 1)];
};

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
```

Then load the JavaScript into `view/home.dust` by adding the following just before the closing `</body>`:

```html
<script src="{@assetPath src="main.js"/}"></script>
```

Note that we're using the `assetPath` helper again.

Now refresh your page in-browser and see what happens. The body background should change on page load.


Congratulations
---------------

You've successfully created your first Shunter application! You've learned:

- Basic application structure
- Using sample data
- Building views
- Writing and loading CSS
- Writing and loading JavaScript

As a next step you can read up on the usage documentation and options reference below, or continue to tweak your new application.


---

Next steps:

- [API Documentation](usage/index.md)
