'use strict';

import log from 'cumulus-common/log';
import { Provider } from 'cumulus-common/models';
import { HttpGranuleIngest, FtpGranuleIngest } from 'cumulus-common/ingest';
import { SQS } from 'cumulus-common/aws-helpers';

const logDetails = {
  file: 'lambdas/pdr/download.js',
  type: 'downloading',
  source: 'downloadGranules'
};


async function processMessage(message) {
  // Example of granule message
  //const granule = {"granuleId":"MYD09A1.A2017081.H24V01.006.2017095190811","protocol":"ftp","provider":"MODAPS_FPROC","host":"modpdr01.nascom.nasa.gov","pdrName":"MODAPSops8.15742522.PDR","collectionName":"MYD09A1_version_006","files":[{"path":"/MODOPS/MODAPS/EDC/CUMULUS/FPROC/DATA","filename":"MYD09A1.A2017081.H24V01.006.2017095190811.HDF","fileSize":750318,"checksumType":"CKSUM","checksumValue":785845502,"url":"modpdr01.nascom.nasa.gov/MODOPS/MODAPS/EDC/CUMULUS/FPROC/DATA/MYD09A1.A2017081.H24V01.006.2017095190811.HDF"},{"path":"/MODOPS/MODAPS/EDC/CUMULUS/FPROC/DATA","filename":"MYD09A1.A2017081.H24V01.006.2017095190811.HDF.MET","fileSize":54640,"checksumType":null,"checksumValue":null,"url":"modpdr01.nascom.nasa.gov/MODOPS/MODAPS/EDC/CUMULUS/FPROC/DATA/MYD09A1.A2017081.H24V01.006.2017095190811.HDF.MET"},{"path":"/MODOPS/MODAPS/EDC/CUMULUS/FPROC/DATA","filename":"BROWSE.MYD09A1.A2017081.H24V01.006.2017095190811.HDF","fileSize":6669,"checksumType":null,"checksumValue":null,"url":"modpdr01.nascom.nasa.gov/MODOPS/MODAPS/EDC/CUMULUS/FPROC/DATA/BROWSE.MYD09A1.A2017081.H24V01.006.2017095190811.HDF"}],"isDuplicate":false}
  const granule = message.Body;
  const receiptHandle = message.ReceiptHandle;

  try {
    let ingest;
    switch (granule.protocol) {
      case 'ftp': {
        // get provider record for username/password
        const p = new Provider();
        const provider = await p.get({ name: granule.provider });


        ingest = new FtpGranuleIngest(granule, provider.config.username, provider.config.password);
        await ingest.ingest();
        break;
      }
      default:
        ingest = new HttpGranuleIngest(granule);
        await ingest.ingest();
    }

    await SQS.deleteMessage(process.env.GranulesQueue, receiptHandle);
  }
  catch (e) {
    log.error(
      `Couldn't ingest files of ${granule.granuleId}. There was an error`,
      e,
      e.stack,
      logDetails
    );
  }
}

/**
 * This is an indefinitely running function the keeps polling
 * the granule SQS queue.
 *
 * After it receives the messages from the queue, xxxxx
 *
 * @param {number} concurrency=1
 * @param {number} visibilityTimeout=200
 */
export async function pollGranulesQueue(concurrency = 1, visibilityTimeout = 200, test = false) {
  while (true) { // eslint-disable-line no-constant-condition
    try {
      // receive a message
      const messages = await SQS.receiveMessage(
        process.env.GranulesQueue,
        concurrency,
        visibilityTimeout
      );

      // get message body
      if (messages.length > 0) {
        // holds list of parallels downloads

        log.info(
          `Ingest: ${messages.length} Granules(s) concurrently`,
          logDetails
        );

        // wait for concurrent downloads to finish before next loop
        // this is important to manage the memory usage better
        await Promise.all(messages.map(processMessage));
      }
      else {
        log.debug('No new messages in the PDR queue', logDetails);

        // if this is a test exit after
        // all messages are processed
        if (test) {
          break;
        }
      }
    }
    catch (e) {
      log.error(e, e.stack, logDetails);
    }
  }
}

