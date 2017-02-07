'use strict';

import _ from 'lodash';
import { esQuery } from 'cumulus-common/es';
import { granule as schema } from 'cumulus-common/schemas';
import { getLimit, getStart } from 'cumulus-common/utils';

const table = process.env.GranulesTable || 'table';
const index = process.env.StackName || 'cumulus-local-test';
const hash = 'collectionName';
const range = 'granuleId';

/**
 * List all granules for a given collection.
 * @param {string} collectionName the name of the collection.
 * @param {object} query an optional query object.
 * @param {number} query.limit maximum number of records to return.
 * @param {number} query.start_at record to start showing from.
 * @return {array} every granule in the database.
 */
export function list(event, context, cb) {
  const collection = _.get(event, hash);
  if (!collection) {
    return cb('Granule#list requires a collectionName property');
  }
  const query = _.get(event, 'query', {});
  const limit = getLimit(query);
  const start = getStart(query);
  esQuery(index, table, {
    query: {
      match: { _all: collection }
    },
    size: limit,
    from: start
  }, (error, res) => {
    if (error) {
      return cb(error);
    } else {
      return cb(null, res);
    }
  });
}

/**
 * Query a single granule.
 * @param {string} collectionName the name of the collection.
 * @param {string} granuleId the id of the granule.
 * @return {object} a single granule object.
 */
export function get(event, context, cb) {
  const collection = _.get(event, hash);
  const granule = _.get(event, range);
  if (!collection || !granule) {
    return cb('Must supply path.collection and path.granuleId');
  }
  esQuery(index, table, {
    query: {
      bool: {
        must: [
          { match: { [hash]: collection } },
          { match: { [range]: granule } }
        ]
      }
    }
  }, (error, res) => {
    if (error) {
      return cb(error);
    } else if (_.isEmpty(res)) {
      return cb('Record was not found');
    } else {
      return cb(null, res[0]);
    }
  });
}
