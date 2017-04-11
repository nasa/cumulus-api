'use strict';

import _ from 'lodash';
import { handle } from 'cumulus-common/response';
import { Granule } from 'cumulus-common/models';
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
  search.query().then(response => cb(null, response)).catch((e) => {
    cb(e);
  });
}

export function put(event, cb) {
  let data = _.get(event, 'body', '{}');
  data = JSON.parse(data);

  const action = _.get(data, 'action', null);
  const step = _.get(data, 'step', 0);

  if (action) {
    const granuleId = _.get(event.pathParameters, 'granuleName');
    const g = new Granule();

    return g.get({ granuleId: granuleId }).then((record) => {
      if (action === 'reprocess') {
        return g.reprocess(record, step);
      }
      else if (action === 'reingest') {
        return g.reingest(granuleId);
      }
      else if (action === 'removeFromCmr') {
        if (!record.published) {
          throw new Error('The granule is not published to CMR');
        }

        return g.unpublish(granuleId, record.cmrProvider);
      }
      throw new Error(`Action <${action}> is not supported`);
    }).then(r => cb(null, r)).catch(e => cb(e));
  }

  return cb('action is missing');
}

export function del(event, cb) {
  const granuleId = _.get(event.pathParameters, 'granuleName');
  const g = new Granule();

  return g.get({ granuleId: granuleId }).then((record) => {
    if (record.published) {
      throw new Error(
        'You cannot delete a granule that is published to CMR. Remove it from CMR first'
      );
    }

    return g.delete({ granuleId: granuleId });
  }).then(() => cb(null, { detail: 'Record deleted' })).catch(e => cb(e));
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
    else if (event.httpMethod === 'DELETE' && event.pathParameters) {
      del(event, cb);
    }
    else {
      list(event, cb);
    }
  });
}


localRun(() => {
  //list({
    //queryStringParameters: {
      //collectionName: 'AST_L1A__version__003',
      //prefix: 'bad'
    //}
  //}, (e, r) => console.log(e, r));

  put({
    pathParameters: {
      granuleName: 'MYD13A1.A2017073.h21v06.006.2017094141555'
    },
    body: '{\n\t"action": "reingest"\n}'
  }, (e, r) => console.log(e, r));
});
