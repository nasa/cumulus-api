'use strict';

var stats = require('../src/controllers/stats');

module.exports.statsSummary = function (event, context, cb) {
  stats.statsSummary(event, cb);
};

module.exports.statsSummaryGrouped = function (event, context, cb) {
  stats.statsSummaryGrouped(event, cb);
};
