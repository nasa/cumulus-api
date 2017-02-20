'use strict';

import _ from 'lodash';
import { Search } from 'cumulus-common/es/search';

/**
 * List all granules for a given collection.
 * @param {object} event aws lambda event object.
 * @param {object} context aws lambda context object
 * @param {callback} cb aws lambda callback function
 * @return {undefined}
 */
export function list(event, context, cb) {
  const search = new Search(event, process.env.GranulesTable);
  search.query().then((response) => cb(null, response)).catch((e) => {
    cb(e);
  });
}

/**
 * Query a single granule.
 * @param {string} collectionName the name of the collection.
 * @param {string} granuleId the id of the granule.
 * @return {object} a single granule object.
 */
export function get(event, context, cb) {
  const collection = _.get(event.params, 'collection');
  const granuleId = _.get(event.params, 'granuleId');

  if (!collection || !granuleId) {
    return cb('Must supply path.collection and path.granuleId');
  }

  const search = new Search({}, process.env.GranulesTable);
  search.get(`${collection}|${granuleId}`).then((response) => {
    cb(null, response);
  }).catch((e) => {
    cb(e);
  });
}
