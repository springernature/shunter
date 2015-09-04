#Running locally with live data

When running Shunter locally, instead of opening a template and it using the local data from the 'data' folder, you can pass it a URL that points to a JSON data endpoint and it will render the template associated with that data. Add a link to the JSON endpoint via the **data** querystring, for example:

    http://localhost:5400/?data=http://mysite.com/jsonendpoint

There are also a number of optional query parameters that you can add:

### Port
Pass a port number to the **port** query parameter.

    http://localhost:5400/?data=http:http://mysite.com/jsonendpoint&port=5000

### Headers
You can also modify the headers for the request by passing a Javascript Object to the **headers** query parameter. The value can be a String, Number, or a Javascript Object consisting of a key/value pair.

    http://localhost:5400/?data=http://json.example.com&headers={"header":"value"}

    http://localhost:5400/?data=http://json.example.com&headers={"header":{"key":"value"}}

### JSON

You can also modify the JSON before rendering. To do this pass an Array of Objects to the **json** query parameter. Each Object within the array must specify a path to update, a value to update the path with, and an action. The accepted actions are replace, append, and prepend, which specifies what you would like to do with the value.

    [
        {
            "path":"foo.bar",
            "value":"foo",
            "action":"replace"
        },
        {
            "path":"baz.qux",
            "value":"bar",
            "action":"append"
        },
        {
            "path":"foo.baz",
            "value":"baz",
            "action":"prepend"
        }
    ]

    http://localhost:5400/?data=http://json.example.com&json=[{"path":"foo.bar","value":"foo","action":"replace"}]

You can also fill in the parameters by using the form that can be found on the local homepage [http://localhost:5400/](http://localhost:5400/).
