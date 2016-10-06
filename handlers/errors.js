'use strict';

var errors = require('../src/controllers/errors');

module.exports.getErrorCounts = function (event, context, cb) {
  errors.getErrorCounts(event, cb);
};

module.exports.listErrors = function (event, context, cb) {
  errors.listErrors(event, cb);
};

module.exports.getErrorCounts = function (event, context, cb) {
  errors.getErrorCounts(event, cb);
};

module.exports.listErrors = function (event, context, cb) {
  errors.listErrors(event, cb);
};
