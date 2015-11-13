#!/usr/bin/env node
'use strict';

var docgen = require('./lib/docgen');
var path = require('path');
var pkg = require('../package.json');
var program = require('commander');

program
    .version(pkg.version)
    .usage('[options] <version>')
    .option(
        '-t, --tmpdir <path>',
        'a temporary directory to store files in. Default: ./docgen-tmp',
        './docgen-tmp'
    )
    .option(
        '-d, --directory <path>',
        'the base directory for documentation. Default: ./docs',
        './docs'
    )
    .option(
        '-r, --repo <url>',
        'the repository URL. Default: git@github.com:nature/shunter.git',
        'git@github.com:nature/shunter.git'
    )
    .parse(process.argv);

var version = program.args[0];
if (program.args.length !== 1) {
    console.error('Version number is required');
    process.exit(1);
}

if (!/^[\/\~]/.test(program.tmpdir)) {
    program.tmpdir = path.resolve(process.cwd(), program.tmpdir);
}

if (!/^[\/\~]/.test(program.directory)) {
    program.directory = path.resolve(process.cwd(), program.directory);
}

// Generate the docs
docgen({
    directory: program.directory,
    repo: program.repo,
    tmpdir: program.tmpdir,
    version: version
}, function (error) {
    if (error) {
        console.error(error.message);
        process.exit(1);
    }
    console.log('Documentation generated');
    process.exit(0);
});
