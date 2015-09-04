'use strict';

process.env.TZ = 'UTC';
module.exports = require('./server');
module.exports.testhelper = require('../tests/helpers/template.js');
