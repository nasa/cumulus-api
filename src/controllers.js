'use strict';

var _ = require('lodash');
var dynamoose = require('dynamoose');
var models = require('./models');
var utils = require('./utils');
var tb = require('./tables');

module.exports.listDataSets = function (req, cb) {
  var Dataset = dynamoose.model(tb.datasetTableName, models.dataSetSchema, {create: false});

  Dataset
        .scan()
        .limit(utils.getLimit(req.query))
        .startAt(utils.startAt('name', 'S', req.query))
        .exec(function (err, datasets) {
          return cb(err, datasets);
        });
};

module.exports.getDataSet = function (req, cb) {
  var Dataset = dynamoose.model(tb.datasetTableName, models.dataSetSchema, {create: false});

  Dataset.get({name: req.path.short_name}, function (err, dataset) {
    if (!dataset) {
      err = 'Record was not found';
    }
    return cb(err, dataset);
  });
};

module.exports.postDataSet = function (req, cb) {
  var Dataset = dynamoose.model(tb.datasetTableName, models.dataSetSchema, {create: false});

  if (_.get(req.headers, 'Token', null) === 'thisisatesttoken') {
    var postedRecord = _.get(req, 'body', {});
    var newRecord = new Dataset(postedRecord);
    newRecord.save(function (err) {
      return cb(err, postedRecord);
    });
  } else {
    return cb('Invalid Token', null);
  }
};

module.exports.listGranules = function (req, cb) {
  // Dataset name
  var tableName = tb.granulesTablePrefix + req.path.dataSet.toLowerCase();

  // WWLLN granules
  var Granules = dynamoose.model(tableName, models.granuleSchema, {create: false, waitForActive: false});

  Granules.scan()
          .limit(utils.getLimit(req.query))
          .startAt(utils.startAt('name', 'S', req.query))
          .exec(function (err, records) {
            if (err) {
              if (err.message === 'Cannot do operations on a non-existent table') {
                return cb(`Requested dataset (${req.path.dataSet}) doesn\'t exist`);
              } else {
                return cb(err.message, null);
              }
            }
            return cb(null, records);
          });
};

module.exports.getGranules = function (req, cb) {
  // Dataset name
  var tableName = tb.granulesTablePrefix + req.path.dataSet.toLowerCase();

  // WWLLN granules
  var Granules = dynamoose.model(tableName, models.granuleSchema, {create: false, waitForActive: false});

  Granules.get({name: req.path.granuleName}, function (err, dataset) {
    if (err) {
      return cb(err.message, null);
    }

    if (!dataset) {
      err = 'Record was not found';
    }

    return cb(err, dataset);
  });
};
