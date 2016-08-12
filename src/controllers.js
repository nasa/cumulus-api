'use strict';

var _ = require('lodash');
var dynamoose = require('dynamoose');
var models = require('./models');
var utils = require('./utils');

module.exports.listDataSets = function(req, cb) {
  models.DataSet
        .scan()
        .limit(utils.getLimit(req.query))
        .startAt(utils.startAt('name', 'S', req.query))
        .exec(function (err, datasets) {
    return cb(err, datasets)
  });
};

module.exports.getDataSet = function(req, cb) {
  models.DataSet.get({name: req.path.short_name}, function(err, dataset) {
    if (!dataset)
      err = 'Record was not found';
    return cb(err, dataset)
  });
};

module.exports.postDataSet = function(req, cb) {

  // var token = utils.getToken(req.headers);

  console.log(req.headers)
  console.log(_.get(req.headers, 'Token', null))

  if (_.get(req.headers, 'Token', null) === 'thisisatesttoken') {
    var newRecord = new models.DataSet(_.get(req, 'body', {}));
    newRecord.save(function (err) {
      return cb(err, newRecord);
    });

  } else {
    return cb('Invalid Token', null);
  }
};


module.exports.listGranules = function(req, cb) {

  //Dataset name
  var tableName = 'granules_' + req.path.dataSet;

  // WWLLN granules
  var Granules = dynamoose.model(tableName, models.granuleSchema, {create: false, waitForActive: false});

  var scan = Granules.scan()
          .limit(utils.getLimit(req.query))
          .startAt(utils.startAt('name', 'S', req.query))
          .exec(function (err, records) {
    if (err) {
      return cb(err.message, null)
    }
    return cb(null, records)
  });
};

module.exports.getGranules = function(req, cb) {

  //Dataset name
  var tableName = 'granules_' + req.path.dataSet;

  // WWLLN granules
  var Granules = dynamoose.model(tableName, models.granuleSchema, {create: false, waitForActive: false});

  Granules.get({name: req.path.granuleName}, function(err, dataset) {
    if (err)
      return cb(err.message, null);
    if (!dataset)
      err = 'Record was not found';
    return cb(err, dataset)
  });
};
