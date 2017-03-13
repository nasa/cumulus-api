'use strict';

import _ from 'lodash';
import { handle } from 'cumulus-common/response';
import { localRun } from 'cumulus-common/local';
import * as schemas from 'cumulus-common/schemas';

export function get(event, cb) {
  const schemaName = _.get(event.pathParameters, 'schemaName');

  return cb(null, schemas[schemaName]);
};

export function handler(event, context) {
  handle(event, context, true, (cb) => {
    get(event, cb);
  });
}

localRun(() => {
  //handler(
    //{ pathParameters: { schemaName: 'provider' } },
    //{ succeed: (r) => console.log(r) }
  //);
  get({ pathParameters: { schemaName: 'provider' } }, (e, r) => console.log(e, r));
});
