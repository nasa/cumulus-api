'use strict';

import log from 'cumulus-common/log';
import { HttpPdrIngest, FtpPdrIngest } from 'cumulus-common/ingest';
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
      let ingest;
      switch (provider.protocol) {
        case 'ftp':
          ingest = new FtpPdrIngest(provider, provider.config.username, provider.config.password);
          await ingest.discover();
          break;
        default: {
          ingest = new HttpPdrIngest(provider);
          await ingest.discover();
        }
      }
    }
  }
  else {
    log.info('No active provider found', logDetails);
  }
}

export function pollProviders(frequency = 300) {
  // run one time then do set interval
  function timed() {
    runActiveProviders()
      .then(() => console.log(`waiting ${frequency} seconds`))
      .catch((e) => {
        console.error(e);
        console.log(`waiting ${frequency} seconds`);
      });
  }

  timed();
  return setInterval(timed, frequency * 1000);
}
