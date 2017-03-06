'use strict';

import res from 'cumulus-common/response';
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
  console.log(event);
  //bind context to res object
  const cb = res.bind(null, context);
  console.log(event.resourcePath);
  if (event.httpMethod === 'GET' && event.resource === '/stats/logs') {
    count(event, cb);
  }
  else {
    list(event, cb);
  }
}

localRun(() => {
  handler(
    {},
    { succeed: (e, r) => console.log(e, r) }
  );
});
