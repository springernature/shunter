---
title: Output Filters - Shunter Documentation
layout: docs
docpath: /usage/output-filters.html
docversion: 2.1.3
---

Output Filters
==============

Output filters allow the rendered output to undergo some post processing before being sent to the client. One of our use cases has been to perform HTML optimizations on the content. This includes things like removing optional closing elements and normalizing boolean attributes.

Filters are defined in ``filters/output`` with their corresponding tests living in the ``tests/server/filters/output`` folder.

Defining an Output Filter
-------------------------

Output filters export a function that accepts up to four parameters. The parameters are a string containing the rendered content, the content type being returned, the request object and the shunter config. It should return the modified content, or undefined if it wants to pass the content through unmodified.

In the following example we'll process responses with a ``text/plain`` content type and replace all instances of shunter with Shunter.

{% highlight js %}
module.exports = function(content, contentType, request, config) {
	if (contentType === 'text/plain') {
		return content.replace(/shunter/ig, 'Shunter');
	}
}
{% endhighlight %}

---

Related:

- [Full API Documentation](index.html)
