'use strict';

import path from 'path';
import log from 'cumulus-common/log';
import { SQS } from 'cumulus-common/aws-helpers';
import { syncUrl, fileNotFound } from 'gitc-common/aws';


/**
 * Uploads a file from a given URL if file is not found on S3
 *
 * @param {string} originalUrl URL of the file that has to be uploaded
 * @param {string} bucket AWS S3 bucket name
 * @param {string} fileName name of the file
 * @param {string} [key=''] s3 folder name(s)
 * @returns {boolean} true if uploaded / false if not
 */
export async function uploadIfNotFound(originalUrl, bucket, fileName, key = '') {
  const fullKey = path.join(key, fileName);
  // check if the file is already uploaded to S3
  const notFound = await fileNotFound(bucket, fileName, key);
  if (notFound) {
    log.info(`Uploading ${fileName} to S3`);
    await syncUrl(originalUrl, bucket, fullKey);
    log.info(`${fileName} uploaded`);
    return true;
  }
  log.info(`${fileName} is already ingested`);
  return false;
}


/**
 * This is an indefinitely running function the keeps polling
 * the granule SQS queue.
 *
 * After it receives the messages from the queue, xxxxx
 *
 * @param {number} concurrency=1
 * @param {number} visibilityTimeout=200
 * @param {number} [testLoops=-1] number of messages to be processd before quitting (for test)
 */
export async function pollGranulesQueue(
  concurrency = 1,
  visibilityTimeout = 200,
  testLoops = -1
) {
  try {
    while (true) {
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

        log.info(`Ingest: ${concurrency} file(s) concurrently`);

        for (const message of messages) {
          const file = message.Body;
          const receiptHandle = message.ReceiptHandle;
          log.info(`Ingesting ${file.fileId}`);
          const func = async () => {
            try {
              await uploadIfNotFound(
                file.fileUrl,
                file.bucket,
                file.fileId,
                file.key
              );
              await SQS.deleteMessage(process.env.GranulesQueue, receiptHandle);
            }
            catch (e) {
              log.error(e, e.stack);
              log.error(`Couldn't ingest ${file.fileId}`);
            }
            return;
          };
          downloads.push(func());
        }

        // wait for concurrent downloads to finish before next loop
        // this is important to manage the memory usage better
        await Promise.all(downloads);
      }
      else {
        log.debug('No new messages in the PDR queue');

        // this prevents the function from running forever in test mode
        if (testLoops === 0) return;
        if (testLoops > 0) testLoops -= 1;
      }
    }
  }
  catch (e) {
    log.error(e, e.stack);
    throw e;
  }
}

