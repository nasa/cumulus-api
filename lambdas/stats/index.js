'use strict';

import _ from 'lodash';
import moment from 'moment';
import { handle } from 'cumulus-common/response';
import { Stats, Histogram } from 'cumulus-common/es/search';
import { localRun } from 'cumulus-common/local';

export function summary(event, cb) {
  let params = _.get(event, 'queryStringParameters', {});
  if (!params) {
    params = {};
  }
  params.timestamp__from = _.get(
    params,
    'timestamp__from',
    moment().subtract(1, 'day').unix()
  );
  params.timestamp__to = _.get(params, 'timestamp__to', Date.now());

  const stats = new Stats({ queryStringParameters: params });
  stats.query().then(r => cb(null, r)).catch(e => cb(e));
}

export function histogram(event, cb) {
  const supportedTypes = {
    granules: process.env.GranulesTable,
    pdrs: process.env.PDRsTable,
    collections: process.env.CollectionsTable,
    logs: null,
    providers: process.env.ProvidersTable,
    resources: process.env.ResourcesTable
  };
  let index;

  const typeRequested = _.get(event, 'queryStringParameters.type', null);
  const type = _.get(supportedTypes, typeRequested);

  if (typeRequested === 'logs') {
    index = `${process.env.StackName}-${process.env.Stage}-logs`;
  }

  const hist = new Histogram(event, type, index);
  hist.query().then(r => cb(null, r)).catch(e => cb(e));
}

export function handler(event, context) {
  handle(event, context, true, (cb) => {
    if (event.httpMethod === 'GET' && event.resource === '/stats') {
      summary(event, cb);
    }
    else if (event.httpMethod === 'GET' && event.resource === '/histogram') {
      histogram(event, cb);
    }
    else {
      summary(event, cb);
    }
  });
}


localRun(() => {
  histogram({ queryStringParameters: {
    type: 'logs', level: 'error', interval: 'month', format: 'YYYY-MM'
  }}, (e, r) => console.log(e, r));
});
