
Introduction to Shunter
=======================

Shunter is a Node.js application built to read JSON and translate it into HTML.

![Shunter as a proxy](diagram.png)

It works by proxying user requests through to a back-end which responds with JSON; then Shunter uses the JSON as a render context, generating output by passing it into your templates.


Benefits
--------

- Can allow different applications and platforms to use the same front end code
- Technology agnostic: if your application outputs JSON, it can work with Shunter
- Enforced decoupling of templates from backend applications, encouraging a clear separation of concerns


Background
----------

TODO a little bit of flavor text about the development of Shunter and why we went in this direction?


---

Next steps:

- [Getting Started](getting-started.md)
