'use strict';

import aws from 'aws-sdk';
import es from 'elasticsearch';
import { localRun, loadCredentials } from './local';

let local = false;
let credentials;
localRun(() => {
  local = true;
  credentials = loadCredentials();
});
if (!local) {
  credentials = new aws.EnvironmentCredentials('AWS');
}

const host = process.env.ES_HOST;
const esConfig = {
  host,
  connectionClass: require('http-aws-es'),
  amazonES: {
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
    credentials
  }
};
export const config = esConfig;

const esClient = new es.Client(esConfig);

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
