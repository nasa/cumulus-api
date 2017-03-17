'use strict';

import _ from 'lodash';
import { handle } from 'cumulus-common/response';
import { localRun } from 'cumulus-common/local';
import { Pdr } from 'cumulus-common/models';
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

export function del(event, cb) {
  const pdrName = _.get(event.pathParameters, 'pdrName');
  const p = new Pdr();

  return p.get({ pdrName })
    .then(() => p.delete({ pdrName }))
    .then(() => cb(null, { detail: 'Record deleted' }))
    .catch(e => cb(e));
}

export function handler(event, context) {
  handle(event, context, true, (cb) => {
    if (event.httpMethod === 'GET' && event.pathParameters) {
      return get(event, cb);
    }
    else if (event.httpMethod === 'DELETE' && event.pathParameters) {
      return del(event, cb);
    }

    return list(event, cb);
  });
}

localRun(() => {
  //handler(
    //{ httpMethod: 'GET', headers: { Authorization: 'Basic xxxxx' } },
    //{ succeed: r => console.log(r) }
  //);

  list({
    queryStringParameters: {
      pdrName: 'good_100_grans_2.PDR',
      //status: 'parsed'
      //createdAt: 1489721558764
      //createdAt__to: 1489721560462,
      //createdAt__from: 1,
      //updatedAt__to: 1489721583764,
      //updatedAt__from: 1489721583764,
      //status__not: 'parsed',
      //provider__in: 'aster_lpdaac_pdrs',
      //change__not: 'what',
      //PAN__exists: false,
      prefix: 'comple',
      //fields: 'status',
      limit: 100
    }
  }, (e, r) => console.log(e, r));
});
