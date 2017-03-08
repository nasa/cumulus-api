'use strict';

import _ from 'lodash';
import { handle } from 'cumulus-common/response';
import { localRun } from 'cumulus-common/local';
import {
  Provider,
  RecordDoesNotExist
} from 'cumulus-common/models';

import { Search } from 'cumulus-common/es/search';

/**
 * List all providers.
 * @param {object} event aws lambda event object.
 * @param {callback} cb aws lambda callback function
 * @return {undefined}
 */
export function list(event, cb) {
  const search = new Search(event, process.env.ProvidersTable);
  search.query().then((response) => cb(null, response)).catch((e) => {
    cb(e);
  });
}

/**
 * Query a single provider.
 * @param {object} event aws lambda event object.
 * @param {string} granuleId the id of the granule.
 * @return {object} a single granule object.
 */
export function get(event, cb) {
  const name = _.get(event.pathParameters, 'name');
  if (!name) {
    return cb('provider name is missing');
  }

  const search = new Search({}, process.env.ProvidersTable);
  search.get(name)
    .then(response => cb(null, response))
    .catch((e) => cb(e));
}

/**
 * Creates a new provider
 * @param {object} event aws lambda event object.
 * @return {object} returns the collection that was just saved.
 */
export function post(event, cb) {
  let data = _.get(event, 'body', '{}');
  data = JSON.parse(data);

  // make sure primary key is included
  if (!data.name) {
    return cb('Field name is missing');
  }
  const name = data.name;

  const p = new Provider();

  p.get({ name: name })
    .then(() => cb(`A record already exists for ${name}`))
    .catch(e => {
      if (e instanceof RecordDoesNotExist) {
        return p.create(data).then(() => {
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
 * Updates an existing provider
 * @param {object} event aws lambda event object.
 * @return {object} a mapping of the updated properties.
 */
export function put(event, cb) {
  const name = _.get(event.pathParameters, 'name');
  if (!name) {
    return cb('provider name is missing');
  }

  let data = _.get(event, 'body', '{}');
  data = JSON.parse(data);

  const p = new Provider();


  // get the record first
  p.get({ name: name }).then(originalData => {
    data = Object.assign({}, originalData, data);

    // handle restart case
    if (data.action === 'restart') {
      return p.restart(name)
        .then((r) => cb(null, r))
        .catch((e) => cb(e));
    }

    // otherwise just update
    return p.create(data);
  }).then(r => cb(null, r)).catch(err => {
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
    { succeed: (r) => console.log(r) }
  );
});
