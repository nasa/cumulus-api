'use strict';

import aws from 'aws-sdk';
import es from 'elasticsearch';
import httpAwsEs from 'http-aws-es';
import { cloneDeep } from 'lodash';
import { localRun } from './local';

let local = false;
let credentials;
localRun(() => {
  local = true;
  credentials = new aws.Credentials(
    process.env.AWS_ACCESS_KEY_ID,
    process.env.AWS_SECRET_ACCESS_KEY
  );
});
if (!local) {
  credentials = new aws.EnvironmentCredentials('AWS');
}

const host = process.env.ES_HOST;
const esConfig = {
  host,
  connectionClass: httpAwsEs,
  amazonES: {
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
    credentials
  }
};
export const config = cloneDeep(esConfig);

const esClient = new es.Client(esConfig);
export const client = esClient;

export function esList (index, type, callback) {
  esClient.search({
    index,
    type,
    query: {
      match_all: {}
    }
  }, (error, res) => {
    if (error) {
      callback(error);
    } else {
      const results = res.hits.hits.map(d => d._source);
      callback(null, results);
    }
  });
}

export function esQuery(index, query, callback) {
  esClient.search({
    body: query,
    index,
  }).then(res => {
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
    index,
    body: query
  }).then(res => callback(null, res.aggregations))
    .catch(err => callback(err));
}

export function esCount(index, query, callback) {
  esClient.count({
    index,
  }, (err, res) => {
    if (err) {
      return callback(err);
    }

    callback(null, res);
  });
}
