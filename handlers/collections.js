'use strict';

var path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '.env'),
  silent: false
});
var collections = require('../src/controllers/collections');

module.exports.list = function (event, context, cb) {
  collections.list(event, cb);
};

module.exports.get = function (event, context, cb) {
  collections.get(event, cb);
};

module.exports.post = function (event, context, cb) {
  collections.post(event, cb);
};
