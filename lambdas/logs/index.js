'use strict';

import { handle } from 'cumulus-common/response';
import { LogSearch } from 'cumulus-common/es/search';
import { localRun } from 'cumulus-common/local';


export function count(event, cb) {
  return cb(null, {});
}

export function list(event, cb) {
  const search = new LogSearch(event);
  search.query().then((response) => cb(null, response)).catch((e) => {
    cb(e);
  });
}


export function handler(event, context) {
  handle(event, context, true, (cb) => {
    if (event.httpMethod === 'GET' && event.resource === '/stats/logs') {
      count(event, cb);
    }
    else {
      list(event, cb);
    }
  });
}

localRun(() => {
  handler(
    {},
    { succeed: (e, r) => console.log(e, r) }
  );
});
