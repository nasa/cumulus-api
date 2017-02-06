'use strict';

import { get as safeGet } from 'lodash';
import { esQuery } from 'cumulus-common/es';
import { granulesTablePrefix } from 'cumulus-common/tables';
import { getLimit, getStart } from 'cumulus-common/utils';

export function list(event, context, cb) {
  const collection = safeGet(event, 'path.collection');
  if (!collection) {
    return cb('Must supply path.collection');
  }
  const tableName = granulesTablePrefix + collection.toLowerCase();
  const limit = getLimit(event.query);
  const start = getStart(event.query);

  esQuery({
    query: {
      match: { _index: tableName }
    },
    size: limit,
    from: start
  }, (error, res) => {
    if (error) {
      return cb(error);
    } else if (_.isEmpty(res)) {
      return cb('Requested collection ' + collection + ' not found');
    } else {
      return cb(null, res);
    }
  });
}

export function get(event, context, cb) {
  const collection = safeGet(event, 'path.collection');
  const granuleName = safeGet(event, 'path.granuleName');
  if (!collection || !granuleName) {
    return cb('Must supply path.collection and path.granuleName');
  }
  const tableName = granulesTablePrefix + collection.toLowerCase();

  esQuery({
    query: {
      bool: {
        must: [
          { match: { _index: tableName } },
          { match: { name: granuleName } }
        ]
      }
    }
  }, (error, res) => {
    if (error) {
      return cb(error);
    } else if (_.isEmpty(res)) {
      // Cannot have more than 1 document, because `name` is the primary Dynamo key
      return cb('Record was not found');
    } else {
      return cb(null, res[0]);
    }
  });
}
