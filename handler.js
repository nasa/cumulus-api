'use strict';

var action = require('./src/controllers');

module.exports.listresults = function(event, context, cb) {
  action.listresults(event, function (err, results) {
    return cb(err, results)
  })
};

module.exports.getDataSet = function(event, context, cb) {
  action.getDataSet(event, function (err, results) {
    return cb(err, results)
  })
};

module.exports.postDataSet = function(event, context, cb) {
  action.postDataSet(event, function (err, results) {
    return cb(err, results)
  })
};


module.exports.listGranules = function(event, context, cb) {
  action.listGranules(event, function (err, results) {
    return cb(err, results)
  })
};

module.exports.getGranules = function(event, context, cb) {
  action.getGranules(event, function (err, results) {
    return cb(err, results)
  })
};
