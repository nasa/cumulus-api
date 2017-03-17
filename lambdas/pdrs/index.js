'use strict';

import _ from 'lodash';
import { handle } from 'cumulus-common/response';
import { localRun } from 'cumulus-common/local';
import { Search } from 'cumulus-common/es/search';

/**
 * List all PDRs.
 * @param {object} event aws lambda event object.
 * @param {callback} cb aws lambda callback function
 * @return {undefined}
 */
export function list(event, cb) {
  const search = new Search(event, process.env.PDRsTable);
  search.query(true).then(response => cb(null, response)).catch((e) => {
    cb(e);
  });
}

/**
 * Query a single PDR.
 * @param {string} collectionName the name of the collection.
 * @param {string} granuleId the id of the granule.
 * @return {object} a single granule object.
 */
export function get(event, cb) {
  const name = _.get(event.pathParameters, 'pdrName');
  if (!name) {
    return cb('PDR#get requires a pdrName property');
  }

  const search = new Search({}, process.env.PDRsTable);
  search.get(name, true).then((response) => {
    // return PDRD message if pdrd query is made
    if (event.queryStringParameters && event.queryStringParameters.pdrd) {
      if (response.PDRD) {
        return cb(null, response.PDRD);
      }
      return cb(null, 'No PDRD Generated');
    }

    cb(null, response);
  }).catch((e) => {
    cb(e);
  });
}

export function handler(event, context) {
  handle(event, context, true, (cb) => {
    if (event.httpMethod === 'GET' && event.pathParameters) {
      return get(event, cb);
    }
    return list(event, cb);
  });
}

localRun(() => {
  handler(
    { httpMethod: 'GET', headers: { Authorization: 'Basic xxxxx' } },
    { succeed: r => console.log(r) }
  );
});
