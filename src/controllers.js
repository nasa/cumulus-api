'use strict';

var _ = require('lodash');
var steed = require('steed');
var dynamoose = require('dynamoose');
var splunkService = require('./splunk');
var models = require('./models');
var utils = require('./utils');
var tb = require('./tables');
var es = require('./es');

module.exports.statsSummary = function (req, callback) {
  steed.series({
    activeDatasets: function (cb) {
      es.esCount('cumulus_datasets', null, function (err, data) {
        if (err) return cb(err);
        cb(null, data.count);
      });
    },
    totalUsers: function (cb) {
      let query = {
        size: 0,
        aggs: {
          users: {
            cardinality: {
              field: 'user'
            }
          }
        }
      };

      es.esAggr('cumulus-distribution-testing', query, function (err, data) {
        if (err) return cb(err);
        cb(null, data.users.value);
      });
    },
    granules: function (cb) {
      es.esCount('cumulus_granules_*', null, function (err, data) {
        if (err) return cb(err);
        cb(null, data.count);
      });
    },
    downloads: function (cb) {
      es.esCount('cumulus-distribution-testing', null, function (err, data) {
        if (err) return cb(err);
        cb(null, data.count);
      });
    },
    error: function (cb) {
      cb(null, {
        errors: {
          datasets: 2,
          total: 10
        }
      });
    },
    updatedAt: function (cb) {
      cb(null, Date.now());
    },
    bandwidth: function (cb) {
      cb(null, 0);
    },
    storageUsed: function (cb) {
      cb(null, 0);
    }
  }, function (err, results) {
    callback(err, results);
  });
};

module.exports.statsSummaryGrouped = function (req, cb) {
  return cb(null, {
    granulesPublished: {
      '2016-09-22': 166,
      '2016-09-21': 23,
      '2016-09-20': 48,
      '2016-09-19': 11,
      '2016-09-18': 102,
      '2016-09-17': 73,
      '2016-09-16': 167,
      '2016-09-15': 65,
      '2016-09-14': 113,
      '2016-09-13': 163
    },
    granulesDownloaded: {
      '2016-09-22': 74,
      '2016-09-21': 66,
      '2016-09-20': 99,
      '2016-09-19': 117,
      '2016-09-18': 116,
      '2016-09-17': 118,
      '2016-09-16': 8,
      '2016-09-15': 100,
      '2016-09-14': 18,
      '2016-09-13': 43
    },
    downloadsPerDataSet: {
      'hs3cpl': 66,
      'hs3hirad': 99,
      'hs3hiwrap': 117,
      'hs3hamsr': 116,
      'hs3wwlln': 118
    },
    totalGranules: {
      '2016-09-22': 47,
      '2016-09-21': 67,
      '2016-09-20': 59,
      '2016-09-19': 19,
      '2016-09-18': 108,
      '2016-09-17': 174,
      '2016-09-16': 0,
      '2016-09-15': 52,
      '2016-09-14': 12,
      '2016-09-13': 123
    },
    topCountries: {
      'USA': 320,
      'Germany': 10,
      'China': 24,
      'UK': 78,
      'France': 110,
      'Brazil': 43,
      'Chile': 21,
      'Mexico': 98,
      'Canada': 45
    },
    numberOfUsers: {
      '2016-09-22': 47,
      '2016-09-21': 67,
      '2016-09-20': 59,
      '2016-09-19': 19,
      '2016-09-18': 108,
      '2016-09-17': 174,
      '2016-09-16': 0,
      '2016-09-15': 52,
      '2016-09-14': 12,
      '2016-09-13': 123
    }
  });
};

module.exports.listDataSets = function (req, cb) {
  es.esQuery({
    query: {
      match: { _index: tb.datasetTableName }
    }
  }, (err, res) => {
    return cb(err, res);
  });
};

module.exports.getDataSet = function (req, cb) {
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

  es.esQuery({
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

  es.esQuery({
    query: {
      bool: {
        must: [
          { match: { _index: tableName } },
          { match: { name: req.path.granuleName } }
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

module.exports.getErrorCounts = function (req, cb) {
  // This query relies on `is_error` being 0 or 1
  let query = 'search index=main | stats sum(is_error) by dataset_id';

  let params = {
    output_mode: 'JSON',
    // Setting count to 0 returns _all_ records
    count: 0
  };

  if (_.get(req, ['query', 'earliestDate'])) { params.earliestDate = `${utils.getEarliestDate(req.query)}T00:00:00.000`; }
  if (_.get(req, ['query', 'latestDate'])) { params.earliestDate = `${utils.getLatestDate(req.query)}T24:00:00.000`; }

  splunkService.oneshotSearch(query, params, (err, results) => {
    if (err) { return cb(err.message, null); }

    results = results.results;

    var response = [];
    results.map(result => {
      if (result.dataset_id !== 'None') {
        result.count = parseInt(result['sum(is_error)']);
        delete result['sum(is_error)'];

        response.push(result);
      }
    });

    return cb(null, response);
  });
};

module.exports.listErrors = function (req, cb) {
  const FIELDS_TO_RETURN = ['timestamp', 'dataset_id', 'process', 'message'];

  // If no dataset is specified, return all datasets
  let datasetID = _.hasIn(req, ['path', 'dataSet']) || '*';

  // Splunk's query syntax is case-insensitive, including in parameters
  let query = `search index=main dataset_id="${datasetID}" is_error=1 | fields ${FIELDS_TO_RETURN.join(',')}`;

  let params = {
    output_mode: 'JSON',
    count: utils.getLimit(req.query)
  };

  if (_.get(req, ['query', 'earliestDate'])) { params.earliestDate = `${utils.getEarliestDate(req.query)}T00:00:00.000`; }
  if (_.get(req, ['query', 'latestDate'])) { params.earliestDate = `${utils.getLatestDate(req.query)}T24:00:00.000`; }

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
