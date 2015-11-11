
API
===

Instead of/in addition to using Shunter as a proxy you can also send JSON in the body of an HTTP POST request to the `/template` endpoint and get back a response containing the rendered HTML.

If our app had a template `hello.dust` containing:

```html
<h1>{data.message}</h1>
```

Then a POST request like this:

```
curl -H 'Content-type: application/json' -X POST -d '{"data": {"message": "Hello!"}}' http://your-shunter-server/template/hello
```

would return:

```html
<h1>Hello!</h1>
```

The template to render can also be specified as part of the JSON payload, so the following request would return the same result:


```
curl -H 'Content-type: application/json' -X POST -d '{"layout": {"template": "hello"}, "data": {"message": "Hello!"}}' http://your-shunter-server/template
```

The maximum size of the POST request can be controlled by setting the `max-post-size` option when starting your app.


---

Related:

- [Full API Documentation](index.md)
