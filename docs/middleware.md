# Middleware

Shunter uses [Connect](https://github.com/senchalabs/connect) under the hood and exposes Connect's `use` method to allow you to add your own middleware to the stack. The middleware that you specify gets mounted before Shunter's proxying behaviour so you're able to hijack certain routes.

Shunter middleware works in the same way as Connect:

```js
var app = shunter({});

// Mount middleware on all routes
app.use(function(request, response, next) {
	// ...
});

// Mount middleware on the /foo route
app.use('/foo', function(request, response, next) {
	// ...
});

app.start();
```

This allows you to expose information about Shunter's environment, or add in routes that you don't wish to hit one of the back end applications that your application proxies to.
