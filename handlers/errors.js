'use strict';

var path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '.env'),
  silent: false
});
var errors = require('../src/controllers/errors');

module.exports.counts = function (event, context, cb) {
  errors.counts(event, cb);
};

module.exports.list = function (event, context, cb) {
  errors.list(event, cb);
};
