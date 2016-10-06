'use strict';

var errors = require('../src/controllers/errors');

module.exports.counts = function (event, context, cb) {
  errors.counts(event, cb);
};

module.exports.list = function (event, context, cb) {
  errors.list(event, cb);
};
