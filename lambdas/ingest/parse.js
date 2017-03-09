'use strict';

import { SQS } from 'cumulus-common/aws-helpers';
import log from 'cumulus-common/log';
import { PdrHttpIngest } from 'cumulus-common/ingest';

const logDetails = {
  file: 'lambdas/pdr/parse.js',
  type: 'parsing',
  source: 'parsePdrs'
};


/**
 * Polls a SQS queue for PDRs that have to be parsed.
 * The function is recursive and calls itself until terminated
 *
 * It receives the message(s) from PDRsQueue and send each message to `parsePdr` for parsing.
 * After successful execuation of `parsePdr`, the function deletes the message from the queue
 * and moves to the next message.
 *
 * @param {number} [messageNum=1] Number of messages to be retrieved from the queue
 * @param {number} [visibilityTimeout=20] How long the message is removed from the queue
 */
export async function pollPdrQueue(messageNum = 1, visibilityTimeout = 20, concurrency = 5) {
  try {
    // receive a message
    const messages = await SQS.receiveMessage(
      process.env.PDRsQueue,
      messageNum,
      visibilityTimeout
    );

    // get message body
    if (messages.length > 0) {
      for (const message of messages) {
        const pdr = message.Body;
        const receiptHandle = message.ReceiptHandle;

        logDetails.provider = pdr.provider.name;
        log.info(`Parsing ${pdr.name}`, logDetails);

        const ingest = new PdrHttpIngest(pdr.provider);
        await ingest.parse(pdr, concurrency);

        // detele message if parse successful
        log.info(`deleting ${pdr.name} from the Queue`, logDetails);
        await SQS.deleteMessage(process.env.PDRsQueue, receiptHandle);
      }
    }
    else {
      log.debug('No new messages in the PDR queue', logDetails);
    }
  }
  catch (e) {
    log.error(e, e.stack, 'pollPdrQueue', logDetails);
  }
  finally {
    // make the function recursive
    pollPdrQueue();
  }
}


/**
 * @typedef {Object} pdrObject
 * @property {string} name pdr name
 * @property {string} url pdr url
 */
