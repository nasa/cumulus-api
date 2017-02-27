'use strict';

import splunk from 'splunk-sdk';
import _ from 'lodash';
import { getEarliestDate, getLatestDate, getLimit } from 'cumulus-common/utils';

const service = new splunk.Service({
  username: process.env.SPLUNK_USERNAME,
  password: process.env.SPLUNK_PASSWORD,
  host: process.env.SPLUNK_HOST,
  port: process.env.SPLUNK_PORT || '8089',
  autologin: true
});

export function counts(event, context, cb) {
  // This query relies on `is_error` being 0 or 1
  const query = 'search index=main | stats sum(is_error) by dataset_id';

  const params = {
    output_mode: 'JSON',
    // Setting count to 0 returns _all_ records
    count: 0
  };

  if (_.get(event, ['query', 'earliestDate'])) {
    params.earliestDate = `${getEarliestDate(event.query)}T00:00:00.000`;
  }

  if (_.get(event, ['query', 'latestDate'])) {
    params.earliestDate = `${getLatestDate(event.query)}T24:00:00.000`;
  }

  service.oneshotSearch(query, params, (err, res) => {
    if (err) return cb(err.message, null);

    const results = res.results;

    const response = results.map(result => {
      if (result.dataset_id !== 'None') {
        const newResult = Object.assign({}, result);
        newResult.count = parseInt(result['sum(is_error)'], 10);
        delete newResult['sum(is_error)'];

        return newResult;
      }

      return false;
    });

    return cb(null, response);
  });
}

export function list(event, context, cb) {
  const FIELDS_TO_RETURN = ['timestamp', 'dataset_id', 'process', 'message'];

  // If no dataset is specified, return all datasets
  const datasetID = _.hasIn(event, ['path', 'dataSet']) || '*';

  // Splunk's query syntax is case-insensitive, including in parameters
  const query = `search index=main dataset_id="${datasetID}" \
  is_error=1 | fields ${FIELDS_TO_RETURN.join(',')}`;

  const params = {
    output_mode: 'JSON',
    count: getLimit(event.query)
  };

  if (_.get(event, ['query', 'earliestDate'])) {
    params.earliestDate = `${getEarliestDate(event.query)}T00:00:00.000`;
  }
  if (_.get(event, ['query', 'latestDate'])) {
    params.earliestDate = `${getLatestDate(event.query)}T24:00:00.000`;
  }

  service.oneshotSearch(query, params, (err, results) => {
    if (err) return cb(err.message, null);

    const fullResults = results.results;

    const newResults = fullResults.map(fullResult => {
      const result = {};
      FIELDS_TO_RETURN.forEach(field => {
        result[field] = fullResult[field];
      });
      return result;
    });

    return cb(null, newResults);
  });
}
