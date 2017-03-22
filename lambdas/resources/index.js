'use strict';

import { handle } from 'cumulus-common/response';
import { Search } from 'cumulus-common/es/search';
import { localRun } from 'cumulus-common/local';

function list(event, cb) {
  const search = new Search(event, process.env.ResourcesTable);
  search.query().then(response => cb(null, response.results[0])).catch((e) => {
    cb(e);
  });
}

export function handler(event, context) {
  handle(event, context, true, (cb) => {
    list(event, cb);
  });
}

localRun(() => {
  handler({}, null, (e, r) => console.log(e, r));
});
