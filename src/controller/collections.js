'use strict';

var _ = require('lodash');
var dynamoose = require('dynamoose');
var models = require('../models');
var tb = require('../tables');
var es = require('../es');

module.exports.listCollections = function (req, cb) {
  es.esQuery({
    query: {
      match: { _index: tb.datasetTableName }
    }
  }, (err, res) => {
    return cb(err, res);
  });
};

module.exports.getCollection = function (req, cb) {
  es.esQuery({
    query: {
      bool: {
        must: [
          { match: { _index: tb.datasetTableName } },
          { match: { name: req.path.short_name } }
        ]
      }
    }
  }, (err, res) => {
    if (err) { return cb(err); }

    // Cannot have more than 1 document, because `name` is the primary Dynamo key
    if (res.length === 0) {
      return cb('Record was not found');
    } else {
      return cb(null, res[0]);
    }
  });
};

module.exports.postCollection = function (req, cb) {
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
