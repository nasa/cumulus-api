'use strict';

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

  for (const provider of r.Items) {
    switch (provider.protocol) {
      case 'ftp':
        // do ftp discover
        break;
      default: {
        const ingest = new PdrHttpIngest(provider);
        try {
          await ingest.ingest();
        }
        catch (e) {
          console.log(e);
        }
      }
    }
  }
}

export async function pollProviders(frequency = 300) {
  // run one time then do set interval
  await runActiveProviders();

  setInterval(() => {
    runActiveProviders();
    console.log(`waiting ${frequency} seconds`);
  }, frequency * 1000);
}
