'use strict';

import _ from 'lodash';
import { esQuery } from 'cumulus-common/es';
import { getLimit, getStart } from 'cumulus-common/utils';

const index = process.env.StackName || 'cumulus-local-test';
const table = process.env.PDRsTable || 'table';
const key = 'pdrName';

/**
 * List all PDRs.
 * @param {object} query an optional query object.
 * @param {number} query.limit maximum number of records to return.
 * @param {number} query.start_at record to start showing from.
 * @return {array} every pdr in the database.
 */
export function list (event, context, cb) {
  const query = _.get(event, 'query', {});
  const limit = getLimit(query);
  const start = getStart(query);
  esQuery(index, table, {
    query: {
      match_all: {}
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
 * Query a single PDR.
 * @param {string} pdrName the name of the PDR.
 * @return {object} a single pdr object.
 */
export function get (event, context, cb) {
  const name = _.get(event, 'pdrName');
  if (!name) {
    return cb('Collection#get requires a pdrName property');
  }
  esQuery(index, table, {
    query: {
      bool: {
        must: [
          { match: { [key]: name } }
        ]
      }
    }
  }, (error, res) => {
    if (error) {
      return cb(error);
    } else if (res.length === 0) {
      return cb('Record was not found');
    } else {
      return cb(null, res[0]);
    }
  });
}
