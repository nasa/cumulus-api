'use strict';

import url from 'url';
import Crawler from 'simplecrawler';
import log from 'cumulus-common/log';
import { SQS } from 'cumulus-common/aws-helpers';
import { syncUrl } from 'gitc-common/aws';
import { Collection, Pdr, RecordDoesNotExist } from 'cumulus-common/models';


const logDetails = {
  file: 'lambdas/pdr/discover.js',
  type: 'ingesting',
  source: 'discoverPdr'
};

/**
 * discovers PDR names with a given url and returns
 * a list of PDRs
 * @param {string} endpoint url to the folder where PDRs are listed:
 * @return {Promise} on success the promise includes a list {@link pdrObject|pdrObjects}
 */
export function discoverPDRs(endpoint, collectionName) {
  const pattern = /<a href="(.*PDR)">/;
  const c = new Crawler(endpoint);

  c.timeout = 2000;
  c.interval = 0;
  c.maxConcurrency = 10;
  c.respectRobotsTxt = false;
  c.userAgent = 'Cumulus';
  c.maxDepth = 1;

  return new Promise((resolve, reject) => {
    c.on('fetchcomplete', (queueItem, responseBuffer) => {
      log.info(`Received the list of PDRs from ${endpoint}`, logDetails);
      const lines = responseBuffer.toString().trim().split('\n');
      const pdrs = [];
      for (const line of lines) {
        const split = line.trim().split(pattern);
        if (split.length === 3) {
          const name = split[1];
          pdrs.push({
            name: name,
            url: url.resolve(endpoint + '/', name)
          });
        }
      }
      resolve(pdrs);
    });

    c.on('fetchtimeout', (err) => {
      // update collections table
      // TODO: has to be replaced with a provider table update
      const collection = new Collection();
      collection.updateStatus({ collectionName: collectionName }, 'stopped')
       .then(() => reject(err));
    });

    c.start();
  });
}


/**
 * uploads a given PDR to S3 and adds it to DynamoDb and sends it to SQS
 * @param {pdrObject} pdr pdr object
 * @return {undefined}
 */
export async function uploadAddQueuePdr(pdr) {
  await syncUrl(pdr.url, process.env.internal, `pdrs/${pdr.name}`);
  log.info(`Uploaded ${pdr.name} to S3`, logDetails);

  pdr.s3Uri = `s3://${process.env.internal}/pdrs/${pdr.name}`;

  // add the pdr to the queue
  // (we use queue here because we want to avoid DDOSing
  // providers
  await SQS.sendMessage(process.env.PDRsQueue, pdr);
  log.info(`Added ${pdr.name} to PDR queue`, logDetails);

  // add the PDR to the table
  const pdrRecord = Pdr.buildRecord(pdr.name, pdr.url);
  pdrRecord.address = pdr.s3Uri;

  const pdrObj = new Pdr();
  await pdrObj.create(pdrRecord);

  log.info(`Saved ${pdr.name} to PDRsTable`, logDetails);
}


export async function pdrHandler(event) {
  // get the collectionName
  if (!event.hasOwnProperty('collectionName')) {
    const e = new Error('you must provide collectionName in the event obj');
    throw e;
  }
  const collectionName = event.collectionName;
  logDetails.collectionName = collectionName;
  log.info('discoverPdrHandler invoked', logDetails);

  // grab collectionName from the database
  const c = new Collection();
  const collection = await c.get({ collectionName: collectionName });

  // get the endpoint from collection
  if (collection.ingest.type !== 'PDR') {
    const e = new Error('This handler only supports PDR ingest');
    log.error(e, logDetails);
    throw e;
  }

  // updating status
  c.updateStatus({
    collectionName: collectionName
  }, 'ingesting');

  const endpoint = collection.ingest.config.endpoint;
  const concurrency = collection.ingest.config.concurrency || 1;
  log.info(`checking ${endpoint}`, logDetails);

  // discover the PDRs
  const pdrs = await discoverPDRs(endpoint, collectionName);
  log.info(`Discovered ${pdrs.length} PDRs`, logDetails);
  for (const pdr of pdrs) {
    // check if the PDR is in the database, if not add it and download
    // Note: if a PDR is already download but missing from the database, it will be
    // redownloaded
    const p = new Pdr();
    try {
      await p.get({ pdrName: pdr.name });
      log.info(`${pdr.name} is already ingested`, logDetails);
    }
    catch (e) {
      if (e instanceof RecordDoesNotExist) {
        pdr.concurrency = concurrency;
        pdr.collectionName = collectionName;

        log.info(`Found new PDR ${pdr.name}`, logDetails);
        await uploadAddQueuePdr(pdr);
      }
    }
  }
  const msg = `All PDRs ingested on ${Date()} for this endpoint: ${endpoint}`;
  log.info(msg, logDetails);
  return msg;
}

