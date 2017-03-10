'use strict';

import path from 'path';
import log from 'cumulus-common/log';
import { HttpGranuleIngest } from 'cumulus-common/ingest';
import { SQS, invoke } from 'cumulus-common/aws-helpers';
import { Granule } from 'cumulus-common/models';
import { syncUrl, fileNotFound } from 'gitc-common/aws';

const logDetails = {
  file: 'lambdas/pdr/download.js',
  type: 'downloading',
  source: 'downloadGranules'
};


async function processMessage(message) {
  const granule = message.Body;
  const receiptHandle = message.ReceiptHandle;

  try {
    switch (granule.protocol) {
      case 'ftp':
        // do ftp
        break;
      default:
        const ingest = new HttpGranuleIngest(granule);
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
        const downloads = [];

        log.info(
          `Ingest: ${concurrency} Granules(s) concurrently`,
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

