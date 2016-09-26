'use strict';

var es = require('elasticsearch');
// var awsES = require('http-aws-es');

// Host should be in a format like:
// search-cluster-name-aaaa00aaaa0aaa0aaaaaaa0aaa.us-east-1.es.amazonaws.com
var esHost = process.env.ES_HOST;
var url = `https://${esHost}`;

// Must have AWS credentials present in environment for this signing function to work

var esClient;

if (esHost === 'localhost') {
  esClient = new es.Client({});
} else {
  esClient = new es.Client({
    host: url
  });
}

module.exports.esQuery = function (query, callback) {
  esClient.search(
    { body: query }
  ).then(res => {
    let results = res.hits.hits.map(document => {
      let item = document._source;
      item._index = document._index;
      delete item['@SequenceNumber'];
      delete item['@timestamp'];
      return item;
    });
    return callback(null, results);
  }).catch(err => {
    return callback(err);
  });
};

module.exports.esAggr = function (index, query, callback) {
  esClient.search({
    index: index,
    body: query
  }).then(res => {
    return callback(null, res.aggregations);
  }).catch(err => {
    return callback(err);
  });
};

module.exports.esCount = function (index, query, callback) {
  esClient.count({
    index: index
  }, (err, res) => {
    if (err) {
      return callback(err);
    }

    callback(null, res);
  });
};
