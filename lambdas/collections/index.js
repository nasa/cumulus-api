'use strict';

import _ from 'lodash';
import { handle } from 'cumulus-common/response';
import { localRun } from 'cumulus-common/local';
import {
  Collection,
  RecordDoesNotExist
} from 'cumulus-common/models';
//import example from 'cumulus-common/tests/data/collection.json';

import { Search } from 'cumulus-common/es/search';

/**
 * List all collections.
 * @param {object} event aws lambda event object.
 * @param {callback} cb aws lambda callback function
 * @return {undefined}
 */
export function list(event, cb) {
  const search = new Search(event, process.env.CollectionsTable);
  search.query(true).then(response => cb(null, response)).catch((e) => {
    cb(e);
  });
}

/**
 * Query a single collection.
 * @param {object} event aws lambda event object.
 * @return {object} a single granule object.
 */
export function get(event, cb) {
  const collectionName = _.get(event.pathParameters, 'short_name');
  if (!collectionName) {
    return cb('collectionName is missing');
  }

  const search = new Search({}, process.env.CollectionsTable);
  search.get(collectionName, true)
    .then(response => cb(null, response))
    .catch(e => cb(e));
}

/**
 * Creates a new collection
 * @param {object} event aws lambda event object.
 * @return {object} returns the collection that was just saved.
 */
export function post(event, cb) {
  let data = _.get(event, 'body', '{}');
  data = JSON.parse(data);

  // make sure primary key is included
  if (!data.collectionName) {
    return cb('Field collectionName is missing');
  }
  const collectionName = data.collectionName;

  const c = new Collection();

  c.get({ collectionName: collectionName })
    .then(() => cb(`A record already exists for ${collectionName}`))
    .catch((e) => {
      if (e instanceof RecordDoesNotExist) {
        return c.create(data).then(() => {
          cb(null, {
            detail: 'Record saved',
            record: data
          });
        }).catch(err => cb(err));
      }

      cb(e);
    });
}

/**
 * Updates an existing collection
 * @param {object} body a set of properties to update on an existing collection.
 * @return {object} a mapping of the updated properties.
 */
export function put(event, cb) {
  const collectionName = _.get(event.pathParameters, 'short_name');
  if (!collectionName) {
    return cb('collectionName is missing');
  }

  let data = _.get(event, 'body', '{}');
  data = JSON.parse(data);

  const c = new Collection();

  // get the record first
  c.get({ collectionName: collectionName }).then((originalData) => {
    data = Object.assign({}, originalData, data);
    return c.create(data);
  }).then(r => cb(null, r)).catch((err) => {
    if (err instanceof RecordDoesNotExist) {
      return cb('Record does not exist');
    }
    cb(err);
  });
}

export function handler(event, context) {
  handle(event, context, true, (cb) => {
    if (event.httpMethod === 'GET' && event.pathParameters) {
      get(event, cb);
    }
    else if (event.httpMethod === 'POST') {
      post(event, cb);
    }
    else if (event.httpMethod === 'PUT' && event.pathParameters) {
      put(event, cb);
    }
    else {
      list(event, cb);
    }
  });
}

localRun(() => {
  //get({ path: { short_name: 'AST_L1A__version__003' } }, null, (e, r) => {
    //console.log(e, r);
  //});

  handler(
    { httpMethod: 'GET' },
    //{ httpMethod: 'POST', body: JSON.stringify(example) },
    { succeed: r => console.log(r) }
  );
});
