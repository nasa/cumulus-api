'use strict';

var path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '.env'),
  silent: false
});
var granules = require('../src/controllers/granules');

module.exports.list = function (event, context, cb) {
  granules.list(event, cb);
};

module.exports.get = function (event, context, cb) {
  granules.get(event, cb);
};
