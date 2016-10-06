'use strict';

var granules = require('../src/controllers/granules');

module.exports.listGranules = function (event, context, cb) {
  granules.listGranules(event, cb);
};

module.exports.getGranules = function (event, context, cb) {
  granules.getGranules(event, cb);
};
