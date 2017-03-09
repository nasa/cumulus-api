'use strict';

import log from 'cumulus-common/log';
import { PdrHttpIngest } from 'cumulus-common/ingest';
import { Provider } from 'cumulus-common/models';

const logDetails = {
  file: 'lambdas/pdr/discover.js',
  type: 'ingesting',
  source: 'discover'
};

export async function runActiveProviders() {
  const p = new Provider();

  const r = await p.scan({
    filter: 'isActive = :value and #s = :s',
    names: { '#s': 'status' },
    values: { ':value': true, ':s': 'ingesting' }
  });

  if (r.Count) {
    for (const provider of r.Items) {
      switch (provider.protocol) {
        case 'ftp':
          // do ftp discover
          break;
        default: {
          const ingest = new PdrHttpIngest(provider);
          try {
            await ingest.discover();
          }
          catch (e) {
            console.log(e);
          }
        }
      }
    }
  }
  else {
    log.info('No active provider found', logDetails);
  }
}

export async function pollProviders(frequency = 300) {
  // run one time then do set interval
  function timed() {
    runActiveProviders()
      .then(() => console.log(`waiting ${frequency} seconds`));
  }

  timed();
  setInterval(timed, frequency * 1000);
}
