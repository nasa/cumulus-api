'use strict';

require('dotenv').config({silent: true});
var granules = require('../src/controllers/granules');

module.exports.list = function (event, context, cb) {
  granules.list(event, cb);
};

module.exports.get = function (event, context, cb) {
  granules.get(event, cb);
};
