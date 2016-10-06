'use strict';

var es = require('../es');
var tb = require('../tables');
var utils = require('../utils');

module.exports.list = function (req, cb) {
  // Dataset name
  var tableName = tb.granulesTablePrefix + req.path.collection.toLowerCase();
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

    if (res.length === 0) { return cb(`Requested dataset (${req.path.collection}) doesn\'t exist`); }
    return cb(null, res);
  });
};

module.exports.get = function (req, cb) {
  // Dataset name
  var tableName = tb.granulesTablePrefix + req.path.collection.toLowerCase();

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
