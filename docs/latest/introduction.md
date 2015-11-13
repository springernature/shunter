---
title: Introduction to Shunter - Shunter Documentation
layout: docs
docpath: /introduction.html
docversion: 3.0.1
---

Introduction to Shunter
=======================

Shunter is a Node.js application built to read JSON and translate it into HTML.

![Shunter as a proxy](/docs/latest/diagram.png)

It works by proxying user requests through to a back-end which responds with JSON; then Shunter uses the JSON as a render context, generating output by passing it into your templates.


Benefits
--------

- Can allow different applications and platforms to use the same front end code
- Technology agnostic: if your application outputs JSON, it can work with Shunter
- Enforced decoupling of templates from backend applications, encouraging a clear separation of concerns


---

Next steps:

- [Getting Started](getting-started.html)
