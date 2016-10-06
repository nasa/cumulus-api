'use strict';

require('dotenv').config({silent: true});
var stats = require('../src/controllers/stats');

module.exports.summary = function (event, context, cb) {
  stats.summary(event, cb);
};

module.exports.summaryGrouped = function (event, context, cb) {
  stats.summaryGrouped(event, cb);
};
