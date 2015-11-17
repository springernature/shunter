---
title: API - Shunter Documentation
layout: docs
docpath: /usage/api.html
docversion: 3.0.1
docbaseurl: /docs/3.0.1
---

API
===

Instead of/in addition to using Shunter as a proxy you can also send JSON in the body of an HTTP POST request to the `/template` endpoint and get back a response containing the rendered HTML.

If our app had a template `hello.dust` containing:

{% highlight html %}
<h1>{data.message}</h1>
{% endhighlight %}

Then a POST request like this:

{% highlight sh %}
curl -H 'Content-type: application/json' -X POST -d '{"data": {"message": "Hello!"}}' http://your-shunter-server/template/hello
{% endhighlight %}

would return:

{% highlight html %}
<h1>Hello!</h1>
{% endhighlight %}

The template to render can also be specified as part of the JSON payload, so the following request would return the same result:


{% highlight sh %}
curl -H 'Content-type: application/json' -X POST -d '{"layout": {"template": "hello"}, "data": {"message": "Hello!"}}' http://your-shunter-server/template
{% endhighlight %}

The maximum size of the POST request can be controlled by setting the `max-post-size` option when starting your app.


---

Related:

- [Full API Documentation](index.html)
