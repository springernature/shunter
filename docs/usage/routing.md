
Routing
=======

- [Examples](#examples)
- [Route Config Options](#route-config-options)
- [Route Override](#route-override)
- [Change Origin](#change-origin)

When Shunter receives an incoming request it needs to know where the request should be proxied to. This is configured by setting a `routes` property when you create your shunter app, typically by requiring a config file:

```js
var app = shunter({
	routes: require('./config/routes.json'),
	...
});
```

Examples
--------

The config is used to match the incoming hostname and request url and match it to a proxy target.

```js
{
	"www.example.com": {
		"/^\\/blog/": {
			"host": "blog.example.com",
			"port": 80
		},
		"/^\\/about/": {
			"host": "about.example.com",
			"port": 1337
		},
		"default": {
			"host": "cms.example.com",
			"port": 8080
		}
	},
	"test-www.example.com": {
		"/^\\/blog/": {
			"host": "test-blog.example.com",
			"port": 80
		},
		"default": {
			"host": "test-cms.example.com",
			"port": 8080
		}
	},
	"localhost": {
		"default": {
			"host": "127.0.0.1",
			"port": 5000
		}
	}
}
```

The table shows how different requests would be mapped using this config:

| Host Header            | Request Url           | Proxy Destination                              |
| :--------------------- | :-------------------- | :--------------------------------------------- |
| `www.example.com`      | `/blog/article123`    | `blog.example.com:80/blog/article123`          |
| `www.example.com`      | `/about/contact.html` | `about.example.com:1337/about/contact.html`    |
| `www.example.com`      | `/foo`                | `cms.example.com:8080/foo`                     |
| `test-www.example.com` | `/blog/article123`    | `test-blog.example.com:80/blog/article123`     |
| `test-www.example.com` | `/about/contact.html` | `test-cms.example.com:8080/about/contact.html` |
| `test-www.example.com` | `/foo`                | `test-cms.example.com:8080/foo`                |
| `foo.example.com`      | `/foo/bar`            | `127.0.0.1:5000/foo/bar`                       |


Route Config Options
--------------------

By default if none of the regex patterns are matched Shunter will use the route under the `default` key. The name of the default key can be configured by providing the `route-config` option when you start your shunter app. So if you had the config:

```js
{
	"www.example.com": {
		"custom": {
			"host": "127.0.0.1",
			"port": 1337
		},
		"default": {
			"host": "127.0.0.1",
			"port": 5000
		}
	}
}
```

And ran your Shunter app with `--route-config=custom` requests would be routed to port 1337 instead of 5000.


Route Override
-------------

Routing can be overridden entirely by setting the `route-override` option. Running your Shunter app with `--route-override=http://www.example.com:1337` would route all requests to that destination. You could also route to an IPv4: `--route-override=8.8.8.8:80`

**n.b**: You MUST specify the protocol `http` or `https` when setting a hostname using `route-override`

You can use the `--origin-override` (`-g`) option in conjunction with the `route-override` option to set `changeOrigin: true` for the overriding route. See [Change Origin](#change-origin) for more details.

This would be useful when deploying your Shunter app to a platform that makes use of environment variables. For example you could start up a Shunter app with:
```
node app -p $PORT --route-override=$BACKEND_APP --origin-override
```


Change Origin
-------------

In addition to setting the host and port for the proxy target there is an additional `changeOrigin` option that can be used. When this is set to true (it defaults to false) Shunter will update the host header to match the destination server. So with the following config:

```js
{
	"www.example.com": {
		"default": {
			"host": "cms.example.com",
			"port": 8080,
			"changeOrigin": true
		}
	}
}
```

The application on cms.example.com would receive requests with a host header of `cms.example.com` instead of `www.example.com`.

---

Related:

- [Full API Documentation](index.md)
