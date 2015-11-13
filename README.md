
Shunter
=======

The website for [Shunter].

http://nature.github.io/shunter


Setup Guide
-----------

- Install [Ruby] and [Bundler]
- Clone this repo
- Run `bundle install`


Running The Site
----------------

- Run `make serve`
- Visit [http://localhost:4000/](http://localhost:4000/)


Development
-----------

Pushes to the `gh-pages` branch will go live immediately. Work on feature branches and use pull-requests. This site is built using [Jekyll], read their docs if you need to make changes.


Building Documentation
----------------------

Documentation is built from the Markdown documentation in the Shunter repo. You can generate versioned documentation with a Node.js script.

- Install [Node] (v4.2+ is required)
- Install dependencies with `npm install`
- Run `node script/docgen.js <version>` (where version is the version of the docs you'd like to build)
- Commit the generated docs like you would any other code



[shunter]: https://github.com/nature/shunter
[bundler]: http://bundler.io/
[jekyll]: http://jekyllrb.com/
[node]: https://nodejs.org/en/
[ruby]: https://www.ruby-lang.org/
