'use strict';

require('dotenv').config({silent: true});
var action = require('./src/controllers');
var triggers = require('./src/triggers');

module.exports.listDataSets = function (event, context, cb) {
  action.listDataSets(event, function (err, results) {
    return cb(err, results);
  });
};

module.exports.getDataSet = function (event, context, cb) {
  action.getDataSet(event, function (err, results) {
    return cb(err, results);
  });
};

module.exports.postDataSet = function (event, context, cb) {
  action.postDataSet(event, function (err, results) {
    return cb(err, results);
  });
};

module.exports.listGranules = function (event, context, cb) {
  action.listGranules(event, function (err, results) {
    console.log(JSON.stringify(results));
    return cb(err, results);
  });
};

module.exports.getGranules = function (event, context, cb) {
  action.getGranules(event, function (err, results) {
    return cb(err, results);
  });
};

module.exports.trigger = function (event, context, cb) {
  triggers.trigger(event.dataset, cb);
};

// triggers.trigger('WWLLN', function (err, results) {
//   console.log(err);
//   console.log(results);
// });

// action.listGranules({
//         path: {
//           dataSet: 'WWLLN'
//         }
//       }, function (err, results) {
//   console.log(JSON.stringify(results));
//   // return cb(err, results);
// });
