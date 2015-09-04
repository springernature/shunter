# Filters
**Data processing belongs to the code that deals with the model, not the view.  Almost all of the time, that equates to the application that sends data to Shunter.**

**Rarely, it is necessary to amend the JSON data passed in purely for the benefit of the view, but with logic that is too complex to put into a template.**

**Before creating a filter, consider if this really is the right place for this data processing be handled.**

**Also, remember you are altering the source data that will be passed into all templates. Be very specific about what you want to change.**

Input filters are part of the shunter rendering process that takes the JSON data object being passed in to shunter and returns an altered version of it before template rendering happens.

The ``filters`` folder sits at the root level in your theme, the associated tests are within the ``tests/server/filters`` folder:

```sh
/filters/
  /input/
    /optionalsubection/
      /myfilter.js
/tests
  /server/
    /filters/
      /input/
        /optionalsubection/
          /myfilter_spec.js
```

Core filters are found in:

```sh
shunter/filters/input
```

Each input filter must expose a single function to perform the modification. The signature of this function will determine how the function gets used. Here are a few contrived examples.

In the simplest case the function accepts a single argument containing the JSON data and returns the data with any modifications made:

```javascript
module.exports = function(data) {
    var nonEmptyThings = data.some_list_of_things.filter(function(thing) {
        return !!thing;
    });
    data.has_some_non_empty_things = nonEmptyThings.length > 0;
    return data;
};
```

Adding a second argument allows the input filter to be run asynchronously, by passing the modified data to a callback once the operation has completed:

```javascript
module.exports = function(data, next) {
    setTimeout(function() {
        data.wait_a_second = true;
        next(data);
    }, 1000);
};
```

A third argument will give you access to the shunter config object:

```javascript
module.exports = function(config, data, next) {
    data.server_tier = config.env.tier();
    next(data); // note: even if this isn't async you need to use the callback
};
```

Finally, specifying five arguments will also get you the request and response objects:

```javascript
module.exports = function(config, request, response, data, next) {
    data.query_data = request.query;
    data.request_url = (request.url) ? request.url.replace(/\?.*$/, '') : '';
    next(data); // note: even if this isn't async you need to use the callback
};
```

Input filters from the core are run first, followed by those defined in themes. Once all input filters have been run the modified data will be passed to dust for rendering.

Note that at the moment all input filters will be run for all requests regardless of theme. At some point in the future we may decide to start namespacing them so only the filters directly relevant to your theme will be run.

