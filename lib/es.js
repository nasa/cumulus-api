'use strict';

import es from 'elasticsearch';

// Host should be in a format like:
// search-cluster-name-aaaa00aaaa0aaa0aaaaaaa0aaa.us-east-1.es.amazonaws.com
const esHost = process.env.ES_HOST;
const url = `https://${esHost}`;

// Must have AWS credentials present in environment for this signing function to work
let esClient;

if (esHost === 'localhost') {
  esClient = new es.Client({});
}
else {
  esClient = new es.Client({
    host: url
  });
}

export function esQuery(query, callback) {
  esClient.search(
    { body: query }
  ).then(res => {
    const results = res.hits.hits.map(document => {
      const item = document._source;
      item._index = document._index;
      delete item['@SequenceNumber'];
      delete item['@timestamp'];
      return item;
    });
    return callback(null, results);
  }).catch(err => callback(err));
}

export function esAggr(index, query, callback) {
  esClient.search({
    index: index,
    body: query
  }).then(res => callback(null, res.aggregations))
    .catch(err => callback(err));
}

export function esCount(index, query, callback) {
  esClient.count({
    index: index
  }, (err, res) => {
    if (err) {
      return callback(err);
    }

    callback(null, res);
  });
}
