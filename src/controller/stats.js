'use strict';

var _ = require('lodash');
var steed = require('steed');
var es = require('../es');

module.exports.statsSummary = function (req, callback) {
  let collectionId;

  if (_.has(req, ['query', 'collection_id'])) {
    collectionId = req.query.collection_id;
  }

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
      let tableName = 'cumulus_granules_*';

      if (collectionId) {
        tableName = 'cumulus_granules_' + collectionId;
      }

      es.esCount(tableName, null, function (err, data) {
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
    errors: function (cb) {
      cb(null, {
        datasets: 2,
        total: 10
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
