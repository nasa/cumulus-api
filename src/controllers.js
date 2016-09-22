'use strict';

var _ = require('lodash');
var dynamoose = require('dynamoose');
var splunkService = require('./splunk');
var models = require('./models');
var utils = require('./utils');
var tb = require('./tables');

module.exports.listDataSets = function (req, cb) {
  utils.esQuery({
    query: {
      match: {
        _index: tb.datasetTableName
      }
    }
  }, (err, res) => {
    return cb(err, res);
  });
};

module.exports.getDataSet = function (req, cb) {
  utils.esQuery({
    query: {
      match: {
        _index: tb.datasetTableName,
        name: req.path.short_name
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
  var limit = utils.getLimit(req.query);
  var start = utils.getStart(req.query);

  utils.esQuery({
    query: {
      match: {
        _index: tableName
      }
    },
    size: limit,
    from: start
  }, (err, res) => {
    if (err) { return cb(err); }

    if (res.length === 0) { return cb(`Requested dataset (${req.path.dataSet}) doesn\'t exist`); }
    return cb(null, res);
  });
};

module.exports.getGranules = function (req, cb) {
  // Dataset name
  var tableName = tb.granulesTablePrefix + req.path.dataSet.toLowerCase();

  utils.esQuery({
    query: {
      match: {
        _index: tableName,
        name: req.path.granuleName
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

module.exports.getErrorCounts = function (req, cb) {
  // This query relies on `is_error` being 0 or 1
  let query = 'search index=main | stats sum(is_error) by dataset_id';

  let params = {
    output_mode: 'JSON',
    // Setting count to 0 returns _all_ records
    count: 0
  };
  if (req.query.earliestDate) { params.earliestDate = `${utils.getEarliestDate(req.query)}T00:00:00.000`; }
  if (req.query.latestDate) { params.earliestDate = `${utils.getLatestDate(req.query)}T24:00:00.000`; }

  splunkService.oneshotSearch(query, params, (err, results) => {
    if (err) { return cb(err.message, null); }

    results = results.results;
    results.forEach(result => {
      result.count = parseInt(result['sum(is_error)']);
      delete result['sum(is_error)'];
    });

    return cb(null, results);
  });
};

module.exports.listErrors = function (req, cb) {
  const FIELDS_TO_RETURN = ['timestamp', 'dataset_id', 'process', 'message'];

  // If no dataset is specified, return all datasets
  let datasetID = req.path.dataSet || '*';

  // Splunk's query syntax is case-insensitive, including in parameters
  let query = `search index=main dataset_id="${datasetID}" is_error=1 | fields ${FIELDS_TO_RETURN.join(',')}`;

  let params = {
    output_mode: 'JSON',
    count: utils.getLimit(req.query)
  };
  if (req.query.earliestDate) { params.earliestDate = `${utils.getEarliestDate(req.query)}T00:00:00.000`; }
  if (req.query.latestDate) { params.earliestDate = `${utils.getLatestDate(req.query)}T24:00:00.000`; }

  splunkService.oneshotSearch(query, params, (err, results) => {
    if (err) { return cb(err.message, null); }

    let fullResults = results.results;
    results = [];

    fullResults.forEach(fullResult => {
      let result = {};
      FIELDS_TO_RETURN.forEach(field => {
        result[field] = fullResult[field];
      });
      results.push(result);
    });

    return cb(null, results);
  });
};
