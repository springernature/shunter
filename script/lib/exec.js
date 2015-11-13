'use strict';

let childProcess = require('child_process');

module.exports = exec;

function exec () {
    let command = Array.prototype.slice.call(arguments).join(' ');
    return childProcess.exec.bind(null, command);
}
