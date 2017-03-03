'use strict';

import splunk from 'splunk-sdk';
import _ from 'lodash';
import { localRun } from 'cumulus-common/local';
import { getEarliestDate, getLatestDate, getLimit } from 'cumulus-common/utils';


function parseQueryParameters(event) {
  let count = 10;
  let page = 1;
  let query = [];
  query.push('search');

  const params = {
    output_mode: 'JSON',
    max_time: 3,
    count: count
  };

  query.push(_.get(event, ['query', 'q'], null));
  query.push(_.get(event, ['query', 'granuleId'], null));
  query.push(_.get(event, ['query', 'pdrName'], null));
  query.push(_.get(event, ['query', 'collectionName'], null));

  if (_.get(event, ['query', 'level'])) {
    const level = _.get(event, ['query', 'level']);
    query.push(`level=${level}`);
  }

  if (_.get(event, ['query', 'date_from'])) {
    const d = new Date(event.query.date_from);
    params.earliest_time = d.toISOString();
  }

  if (_.get(event, ['query', 'date_to'])) {
    const d = new Date(event.query.date_to);
    params.latest_time = d.toISOString();
  }

  if (_.get(event, ['query', 'limit'])) {
    count = parseInt(event.query.limit);
    params.count = count;
  }

  if (_.get(event, ['query', 'page'])) {
    page = parseInt(event.query.page);
    params.offset = (page - 1) * count;
  }

  query = query.join(' ');

  return {
    query,
    params,
    page,
    count
  };
}


export function counts(event, context, cb) {
  const service = new splunk.Service({
    username: process.env.SPLUNK_USERNAME,
    password: process.env.SPLUNK_PASSWORD,
    host: process.env.SPLUNK_HOST,
    port: process.env.SPLUNK_PORT || '8089',
    autologin: true
  });

  const parsed = parseQueryParameters(event);

  // add stats and groupBy
  const groupBy = _.get(event, ['query', 'group_by'], 'granuleId');
  parsed.query += ` | stats count by meta.${groupBy}`;

  service.oneshotSearch(parsed.query, parsed.params, (err, results) => {
    if (err) return cb(err.message, null);

    const response = {
      meta: {
        name: 'cumulus-api',
        limit: parsed.count,
        page: parsed.page,
        count: results.results.length,
        fields: results.fields
      },
      results: results.results
    };

    return cb(null, response);
  });
}

export function list(event, context, cb) {
  const service = new splunk.Service({
    username: process.env.SPLUNK_USERNAME,
    password: process.env.SPLUNK_PASSWORD,
    host: process.env.SPLUNK_HOST,
    port: process.env.SPLUNK_PORT || '8089',
    autologin: true
  });

  const parsed = parseQueryParameters(event);

  service.oneshotSearch(parsed.query, parsed.params, (err, results) => {
    if (err) return cb(err.message, null);

    const response = {
      meta: {
        name: 'cumulus-api',
        limit: parsed.count,
        page: parsed.page,
        count: results.results.length
      },
      results: results.results.map(r => JSON.parse(r._raw))
    };

    return cb(null, response);
  });
}


localRun(() => {
  counts({query: {}}, null, (e, r) => {
    console.log(e);
    console.log(r);
  });
});
