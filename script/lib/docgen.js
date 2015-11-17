'use strict';

let async = require('async');
let cheerio = require('cheerio');
let exec = require('./exec');
let fs = require('fs');
let glob = require('glob');
let marked = require('marked');
let path = require('path');

module.exports = docgen;

function docgen (options, done) {
    options.baseurl = '/docs/' + options.version;
    options.latestbaseurl = '/docs/latest';
    options.tmpdirdocs = path.join(options.tmpdir, 'docs');
    options.versiondir = path.join(options.directory, options.version);
    options.latestdir = path.join(options.directory, 'latest');
    async.series([

        // Remove leftover directories from if the last run failed
        exec('rm -rf', options.tmpdir),
        exec('rm -rf', options.versiondir),
        exec('rm -rf', options.latestdir),

        // Create the documentation directory
        exec('mkdir -p', options.directory),

        // Clone the repository
        exec('git clone --depth 1 --branch ', options.version, options.repo, options.tmpdir),

        // Process version-tagged Markdown files and copy into place
        exec('cp -r', options.tmpdirdocs, options.versiondir),
        processMarkdownFiles(options.versiondir, options),

        // Process latest Markdown files and copy into place
        exec('cp -r', options.tmpdirdocs, options.latestdir),
        processMarkdownFiles(options.latestdir, options, true),

        // Generate a list of all the versions of the documentation
        generateVersionList(options),

        // Remove temporary directories
        exec('rm -rf', options.tmpdir)

    ], done);
}

function processMarkdownFiles (dir, options, isLatest) {
    let pattern = path.join(dir, '**', '*.md');
    return done => {
        if (isLatest) {
            options.isLatest = true;
        }
        glob(pattern, (error, files) => {
            if (error) {
                return done(error);
            }
            async.each(files, processMarkdownFile.bind(null, options), done);
        });
    }
}

function processMarkdownFile (options, filePath, done) {
    let baseurl = (options.isLatest ? options.latestbaseurl : options.baseurl);
    let basedir = (options.isLatest ? options.latestdir : options.versiondir);
    async.waterfall([

        // Load the Markdown file
        fs.readFile.bind(null, filePath, 'utf-8'),

        // Process the Markdown
        (fileContents, next) => {
            console.log('Processing', (options.isLatest ? 'latest' : options.version), filePath.replace(options.tmpdir, ''));
            next(null, fileContents);
        },

        // Replace logo-only headings with text
        (fileContents, next) => {
            next(null, fileContents.replace(/\#\s*\!\[shunter\]\(shunter-logo\.png\)/gi, '# Shunter Documentation'));
        },

        // Resolve links in the Markdown
        (fileContents, next) => {
            next(null, fileContents.replace(/\]\(([^\)]+)\)/gi, (match, link) => {

                // Don't touch http links
                if (/^https?\:\/\//i.test(link)) {
                    return match;
                }

                // Replace markdown paths
                link = link.replace(/^(.{1,2}\/)*([a-z0-9\-\_][a-z0-9\-\_\/\.]*)\.md/gi, '$1$2.html');

                // Replace image paths
                link = link.replace(/^([a-z0-9\-\_][a-z0-9\-\_\/]*\.(gif|jpeg|jpg|png|svg))/gi, baseurl + '/$1');

                return '](' + link + ')';
            }));
        },

        // Add Jekyll front-matter to the Markdown
        (fileContents, next) => {

            // We need to parse the Markdown to extract a title :(
            let html = marked(fileContents);
            let $ = cheerio.load(html);
            let title = $('h1,h2,h3,h4,h5,h6').first().text().trim();

            // These two conditionals cater for the title actually being "Shunter Documentation"
            if (!title) {
                title = 'Shunter Documentation';
            }
            if (title && title !== 'Shunter Documentation') {
                title = `${title} - Shunter Documentation`;
            }

            let path = filePath
                .replace(basedir, '')
                .replace(/\.md$/, '.html')
                .replace('index.html', '');

            let frontMatter = `---
                title: ${title}
                layout: docs
                docpath: ${path}
                docversion: ${options.version}
                docbaseurl: ${baseurl}
                ---
            `.replace(/([\r\n]+)\s+/g, '$1');
            next(null, frontMatter + fileContents);
        },

        // Replace GitHub Flavoured Markdown code blocks with Liquid templates
        (fileContents, next) => {
            next(null, fileContents.replace(/```([^\s]+)?((?:(?!```)[.\s\S])*)```/gim, (match, language, code) => {
                return `{% highlight ${language || 'sh'} %}${code}{% endhighlight %}`;
            }));
        },

        // Save the Markdown file
        fs.writeFile.bind(null, filePath)

    ], done);
}

function generateVersionList (options) {
    let pattern = path.join(options.directory, '*');
    return done => {
        glob(pattern, (error, files) => {
            if (error) {
                return done(error);
            }
            let versions = files.map(file => '- ' + file.replace(options.directory + '/', '')).reverse();
            fs.writeFile(__dirname + '/../../_data/versions.yml', '# THIS FILE IS AUTO-GENERATED. DO NOT EDIT\n' + versions.join('\n'));
            done();
        });
    }
}
