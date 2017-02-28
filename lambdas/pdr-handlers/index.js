'use strict';

import _ from 'lodash';
import { localRun } from 'cumulus-common/local';
import { Search } from 'cumulus-common/es/search';

/**
 * List all PDRs.
 * @param {object} event aws lambda event object.
 * @param {object} context aws lambda context object
 * @param {callback} cb aws lambda callback function
 * @return {undefined}
 */
export function list(event, context, cb) {
  const search = new Search(event, process.env.PDRsTable);
  search.query(true).then((response) => cb(null, response)).catch((e) => {
    cb(e);
  });
}

/**
 * Query a single PDR.
 * @param {string} collectionName the name of the collection.
 * @param {string} granuleId the id of the granule.
 * @return {object} a single granule object.
 */
export function get(event, context, cb) {
  const name = _.get(event.params, 'pdrName');
  if (!name) {
    return cb('PDR#get requires a pdrName property');
  }

  const search = new Search({}, process.env.PDRsTable);
  search.get(name, true).then((response) => {
    cb(null, response);
  }).catch((e) => {
    cb(e);
  });
}

localRun(() => {
  list({}, null, (e, r) => {
    console.log(e, r);
  });
});
