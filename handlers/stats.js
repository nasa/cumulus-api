'use strict';

var path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '.env'),
  silent: false
});
var stats = require('../src/controllers/stats');

module.exports.summary = function (event, context, cb) {
  stats.summary(event, cb);
};

module.exports.summaryGrouped = function (event, context, cb) {
  stats.summaryGrouped(event, cb);
};
