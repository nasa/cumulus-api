'use strict';

import _ from 'lodash';
import { handle } from 'cumulus-common/response';
import { Granule } from 'cumulus-common/models';
import { invoke } from 'cumulus-common/aws-helpers';
import { localRun } from 'cumulus-common/local';
import { Search } from 'cumulus-common/es/search';

/**
 * List all granules for a given collection.
 * @param {object} event aws lambda event object.
 * @param {object} context aws lambda context object
 * @param {callback} cb aws lambda callback function
 * @return {undefined}
 */
export function list(event, cb) {
  const search = new Search(event, process.env.GranulesTable);
  search.query().then((response) => cb(null, response)).catch((e) => {
    cb(e);
  });
}

export function put(event, cb) {
  const action = _.get(event, ['body', 'action'], null);

  if (action && action === 'reprocess') {
    const granuleId = _.get(event, ['path', 'granuleName']);
    // TODO: send the granule for processing
    const g = new Granule();

    g.get({ granuleId: granuleId }).then(record => {
      record.status = 'processing';

      return invoke(
        process.env.dispatcher,
        {
          previousStep: 0,
          nextStep: 0,
          granuleRecord: record
        }
      );
    }).then(r => cb(null, r))
      .catch(e => cb(e));
  }
  else {
    return cb('action is missing');
  }
}

/**
 * Query a single granule.
 * @param {string} collectionName the name of the collection.
 * @param {string} granuleId the id of the granule.
 * @return {object} a single granule object.
 */
export function get(event, cb) {
  const granuleId = _.get(event.pathParameters, 'granuleName');

  const search = new Search({}, process.env.GranulesTable);
  search.get(granuleId).then((response) => {
    cb(null, response);
  }).catch((e) => {
    cb(e);
  });
}


export function handler(event, context) {
  handle(event, context, true, (cb) => {
    if (event.httpMethod === 'GET' && event.pathParameters) {
      get(event, cb);
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

});
