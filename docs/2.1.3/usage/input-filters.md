---
title: Input Filters - Shunter Documentation
layout: docs
docpath: /usage/input-filters.html
docversion: 2.1.3
docbaseurl: /docs/2.1.3
---

Input Filters
=============

Data processing belongs to the code that deals with the model, not the view. Almost all of the time, that equates to the application that sends data to Shunter.

Rarely, it is necessary to amend the JSON data passed in purely for the benefit of the view, but with logic that is too complex to put into a template. This can be done using an Input Filter.

Before creating a filter, consider carefully if this really is the right place for this data processing be handled.

Input filters are part of the shunter rendering process. They take the JSON data being passed to shunter and return an altered version of it before template rendering happens.

If you want to add input filters to your project they are defined in ``filters/input`` their corresponding tests live in the ``tests/server/filters/input`` folder.

Defining An Input Filter
------------------------

At their most basic an input filter exports a function that accepts a single parameter containing the JSON for the request and returns the data with any modifications made.

{% highlight js %}
module.exports = function(data) {
	data.corresponding_authors = data.authors.filter(function(author) {
		return author.is_corresponding_author;
	});
	return data;
};
{% endhighlight %}

Input filters change their behaviour based on the arity of the function you export. If you define a second parameter this will be assumed to be a callback allowing your input filter to perform asynchronously. **Be careful though, rendering will not start until all input filters have completed, so try to avoid kicking off any async processes that will take a long time to complete**.

{% highlight js %}
module.exports = function(data, next) {
	setTimeout(function() {
		data.wait_a_second = true;
		next(data);
	}, 1000);
};
{% endhighlight %}

Adding a third argument to the filter provides access to the shunter config object. Note that even if the function is synchronous you need to use the callback to pass control to the next input filter in the chain. The following would make the hostname of the machine running shunter accessible to the template.

{% highlight js %}
module.exports = function(config, data, next) {
	data.hostname = config.env.host();
	next(data);
};
{% endhighlight %}

Defining a function with five arguments additionally provides access to the request and response objects. Here we populate a property on the model containing the request query parameters.

{% highlight js %}
module.exports = function(config, request, response, data, next) {
	data.query_data = request.query;
	next(data);
};
{% endhighlight %}

---

Related:

- [Full API Documentation](index.html)
