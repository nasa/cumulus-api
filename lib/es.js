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
  }, (err, res) => {
    if (err) {
      callback(err);
    } else {
      callback(null, res.hits.hits.map(d => d._source));
    }
  });
}

export function esQuery(index, type, query, callback) {
  esClient.search({
    index,
    type,
    body: query,
  }, (err, res) => {
    if (err) {
      callback(err);
    } else {
      callback(null, res.hits.hits.map(d => d._source));
    }
  });
}

export function esAggr(index, query, callback) {
  esClient.search({
    index,
    body: query
  }, (err, res) => {
    if (err) {
      callback(err);
    } else {
      callback(null, res.aggregations);
    }
  });
}

export function esCount(index, query, callback) {
  esClient.count({
    index,
  }, (err, res) => {
    if (err) {
      return callback(err);
    } else {
      callback(null, res);
    }
  });
}
