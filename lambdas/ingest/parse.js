'use strict';

import { SQS } from 'cumulus-common/aws-helpers';
import log from 'cumulus-common/log';
import { HttpPdrIngest, FtpPdrIngest } from 'cumulus-common/ingest';

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
export async function pollPdrQueue(
  messageNum = 1,
  visibilityTimeout = 20,
  concurrency = 5,
  test = false
) {
  try {
    // receive a message
    const messages = await SQS.receiveMessage(
      process.env.PDRsQueue,
      messageNum,
      visibilityTimeout
    );

    // Example of parse message
    //const messages = [{Body: {"name":"MODAPSops8.15742522.PDR","provider":{"isActive":true,"lastTimeIngestedAt":1491431669575,"path":"/MODOPS/MODAPS/EDC/CUMULUS/FPROC/PDR/","config":{"password":"xxxx","username":"xxxxx"},"host":"modpdr01.nascom.nasa.gov","updatedAt":1491431669575,"protocol":"ftp","status":"ingesting","providerName":"MODAPS","createdAt":1491335902735,"regex":{"MYD09A1_version_006":"(MYD09A1\\.(.*))\\.(hdf|HDF)"},"name":"MODAPS_FPROC"},"url":"modpdr01.nascom.nasa.gov/MODOPS/MODAPS/EDC/CUMULUS/FPROC/PDR/MODAPSops8.15742522.PDR","s3Uri":"s3://cumulus-internal/pdrs/MODAPSops8.15742522.PDR"}}]

    // get message body
    if (messages.length > 0) {
      for (const message of messages) {
        const pdr = message.Body;
        const receiptHandle = message.ReceiptHandle;

        logDetails.provider = pdr.provider.name;
        log.info(`Parsing ${pdr.name}`, logDetails);

        let ingest;
        switch (pdr.provider.protocol) {
          case 'ftp':
            ingest = new FtpPdrIngest(pdr.provider);
            await ingest.parse(pdr, concurrency);
            break;
          default:
            ingest = new HttpPdrIngest(pdr.provider);
            await ingest.parse(pdr, concurrency);
        }

        // detele message if parse successful
        log.info(`deleting ${pdr.name} from the Queue`, logDetails);
        await SQS.deleteMessage(process.env.PDRsQueue, receiptHandle);
      }
    }
    else {
      console.log('No new messages in the PDR queue');
    }
  }
  catch (e) {
    log.error(e, e.stack, 'pollPdrQueue', logDetails);
  }
  finally {
    // make the function recursive unless it is for test
    if (!test) {
      pollPdrQueue();
    }
  }
}


/**
 * @typedef {Object} pdrObject
 * @property {string} name pdr name
 * @property {string} url pdr url
 */
