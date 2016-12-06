'use strict';

import { esQuery } from 'cumulus-common/es';
import { granulesTablePrefix } from 'cumulus-common/tables';
import { getLimit, getStart } from 'cumulus-common/utils';

export function list(event, context, cb) {
  // Dataset name
  const tableName = granulesTablePrefix + event.path.collection.toLowerCase();
  const limit = getLimit(event.query);
  const start = getStart(event.query);

  esQuery({
    query: {
      match: {
        _index: tableName
      }
    },
    size: limit,
    from: start
  }, (err, res) => {
    if (err) return cb(err);

    if (res.length === 0) {
      return cb(`Requested dataset (${event.path.collection}) doesn\'t exist`);
    }

    return cb(null, res);
  });
}

export function get(event, context, cb) {
  // Dataset name
  const tableName = granulesTablePrefix + event.path.collection.toLowerCase();

  esQuery({
    query: {
      bool: {
        must: [
          { match: { _index: tableName } },
          { match: { name: event.path.granuleName } }
        ]
      }
    }
  }, (err, res) => {
    if (err) return cb(err);

    // Cannot have more than 1 document, because `name` is the primary Dynamo key
    if (res.length === 0) {
      return cb('Record was not found');
    }

    return cb(null, res[0]);
  });
}
