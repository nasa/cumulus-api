'use strict';

import _ from 'lodash';
import moment from 'moment';
import { handle } from 'cumulus-common/response';
import { Stats } from 'cumulus-common/es/search';
import { localRun } from 'cumulus-common/local';


function getType(event) {
  let index;

  const supportedTypes = {
    granules: process.env.GranulesTable,
    pdrs: process.env.PDRsTable,
    collections: process.env.CollectionsTable,
    logs: null,
    providers: process.env.ProvidersTable,
    resources: process.env.ResourcesTable
  };

  const typeRequested = _.get(event, 'queryStringParameters.type', null);
  const type = _.get(supportedTypes, typeRequested);

  if (typeRequested === 'logs') {
    index = `${process.env.StackName}-${process.env.Stage}-logs`;
  }

  return { type, index };
}

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
  const type = getType(event);

  const stats = new Stats(event, type.type, type.index);
  stats.histogram().then(r => cb(null, r)).catch(e => cb(e));
}

export function count(event, cb) {
  const type = getType(event);

  const stats = new Stats(event, type.type, type.index);
  stats.count().then(r => cb(null, r)).catch(e => cb(e));
}

export function average(event, cb) {
  const type = getType(event);

  const stats = new Stats(event, type.type, type.index);
  stats.avg().then(r => cb(null, r)).catch(e => cb(e));
}

export function handler(event, context) {
  handle(event, context, true, (cb) => {
    if (event.httpMethod === 'GET' && event.resource === '/stats') {
      summary(event, cb);
    }
    else if (event.httpMethod === 'GET' && event.resource === '/stats/histogram') {
      histogram(event, cb);
    }
    else if (event.httpMethod === 'GET' && event.resource === '/stats/aggregate') {
      count(event, cb);
    }
    else if (event.httpMethod === 'GET' && event.resource === '/stats/average') {
      average(event, cb);
    }
    else {
      summary(event, cb);
    }
  });
}


localRun(() => {
  average({ queryStringParameters:
  {
    type: '', field: 'tasks.pendingTasks'
  }
  }, (e, r) => console.log(e, r));
});
