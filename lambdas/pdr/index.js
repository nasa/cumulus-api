'use strict';

import {
  sendMessage,
  receiveMessage,
  putItem,
  deleteMessage,
  query
} from 'cumulus-common/aws-helpers';
import { localRun } from 'cumulus-common/local';
import { syncUrl, downloadS3Files, fileNotFound } from 'gitc-common/aws';
import Crawler from 'simplecrawler';
import steed from 'steed';
import url from 'url';
import log from 'gitc-common/log';
import pvl from 'pvl';
import path from 'path';
import fs from 'fs';


/**
 * discovers PDR names with a given url and returns
 * a list of PDRs
 * @param {string} endpoint url to the folder where PDRs are listed:
 * @return {Promise} on success the promise includes a list {@link pdrObject|pdrObjects}
 */
function discoverPDRs(endpoint) {
  const pattern = /<a href="(PDN.*)">/;
  const c = new Crawler(endpoint);

  c.interval = 0;
  c.maxConcurrency = 10;
  c.respectRobotsTxt = false;
  c.userAgent = 'Cumulus';
  c.maxDepth = 1;

  return new Promise((resolve) => {
    c.on('fetchcomplete', (queueItem, responseBuffer) => {
      log.info(`Received the list of PDRs from ${endpoint}`);
      const lines = responseBuffer.toString().trim().split('\n');
      const list = [];
      for (const line of lines) {
        const split = line.trim().split(pattern);
        if (split.length === 3) {
          const name = split[1];
          list.push({
            name: name,
            url: url.resolve(endpoint, name)
          });
        }
      }

      resolve(list);
    });

    c.start();
  });
}


/**
 * Uploads a file from a given URL if file is not found on S3
 *
 * @param {string} originalUrl URL of the file that has to be uploaded
 * @param {string} bucket AWS S3 bucket name
 * @param {string} fileName name of the file
 * @param {string} [key=''] s3 folder name(s)
 * @returns {boolean} true if uploaded / false if not
 */
async function uploadIfNotFound(originalUrl, bucket, fileName, key = '') {
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
 * uploads a given PDR to S3, adds to DynamoDb and sends it to SQS
 * @param {pdrObject} pdr pdr object
 * @return {undefined}
 */
async function uploadPdr(pdr) {
  log.info(`Uploading ${pdr.name} to S3`);
  await syncUrl(pdr.url, process.env.internal, `pdrs/${pdr.name}`);

  // add the pdr to the queue
  // (we use queue here because we want to avoid DDOSing
  // providers
  log.info(`Adding ${pdr.name} to PDR queue`);
  await sendMessage(pdr, process.env.PDRsQueue);

  // add the PDR to the table
  const params = {
    Item: {
      pdrName: {
        S: pdr.name
      },
      originalUrl: {
        S: pdr.url
      },
      s3Uri: {
        S: `s3://${process.env.internal}/pdrs/${pdr.name}`
      }
    },
    TableName: process.env.PDRsTable
  };

  // saving the item
  await putItem(params);
  log.info(`Saved ${pdr.name} to PDRsTable`);
}


/**
 * This async function parse a PDR stored on S3 and download all the files
 * in the PDR to a staging S3 bucket. The return is void
 * @param {string} pdrName name of the PDR on s3. The PDR must be on cumulus-internal/pdrs folder
 * @return {undefined}
 */
async function parsePdr(pdrName) {
  try {
    // first download the PDR
    await downloadS3Files(
      [{ Bucket: process.env.internal, Key: `pdrs/${pdrName}` }],
      '.'
    );

    // then read the file and and pass it to parser
    const pdr = fs.readFileSync(pdrName);
    const parsed = pvl.pvlToJS(pdr.toString());

    // Get all the file groups
    const fileGroups = parsed.objects('FILE_GROUP');

    for (const group of fileGroups) {
      // get all the file specs in each group
      const specs = group.objects('FILE_SPEC');

      // Add the granule to DynamoDB

      // Add eachfile to the Queue to be downloaded
      for (const spec of specs) {
        const directoryId = spec.get('DIRECTORY_ID').value;
        const fileId = spec.get('FILE_ID').value;
        const fileUrl = url.resolve('https://e4ftl01.cr.usgs.gov:40521/', `${directoryId}/${fileId}`);

        //log.info(`Adding ${fileId} to GranuleQueue for download`);
        await sendMessage({
          fileUrl,
          fileId,
          bucket: process.env.internal,
          key: 'staging'
        }, process.env.GranulesQueue);
      }
    }

    return true;
  }
  catch (e) {
    log.error(e.message, e.stack);
    return false;
  }
}

async function pollGranulesQueue(concurrency = 1, visibilityTimeout = 200) {
  try {
    // receive a message
    const messages = await receiveMessage(
      process.env.GranulesQueue,
      concurrency,
      visibilityTimeout
    );

    // get message body
    if (messages.Messages) {
      // holds list of parallels downloads
      const downloads = [];

      log.info(`Ingest: ${concurrency} file(s) concurrently`);

      for (const message of messages.Messages) {
        const body = message.Body;
        const receiptHandle = message.ReceiptHandle;
        const file = JSON.parse(body);
        downloads.push((cb) => {
          log.info(`Ingesting ${file.fileId}`);
          uploadIfNotFound(
            file.fileUrl,
            file.bucket,
            file.fileId,
            file.key
          ).then((success) => {
            if (success) {
              // delete the message from the queue
              deleteMessage(process.env.GranulesQueue, receiptHandle).then(() => cb(null));
            }
            else {
              cb('Download failed');
            }
          }).catch((err) => console.error(err));
        });
      }

      // Run the downloads in parallel
      steed.parallel(downloads, (err) => {
        if (err) {
          throw err;
        }
        else {
          // run the poll recursively
          pollGranulesQueue(concurrency, visibilityTimeout);
        }
      });
    }
    else {
      log.info('No new messages in the PDR queue');
      // fun the poll again
      pollGranulesQueue(concurrency, visibilityTimeout);
    }
  }
  catch (e) {
    log.error(e);
    throw e;
  }
}


/**
 * Polls a SQS queue for PDRs that have to be parsed.
 * The function is recursive and calls itself for ever
 * @param {number} [messageNum=1] Number of messages to be retrieved from the queue
 * @param {number} [visibilityTimeout=20] How long the message is removed from the queue
 */
async function pollPdrQueue(messageNum = 1, visibilityTimeout = 20) {
  try {
    // receive a message
    const messages = await receiveMessage(
      process.env.PDRsQueue,
      messageNum,
      visibilityTimeout
    );

    // get message body
    if (messages.Messages) {
      for (const message of messages.Messages) {
        const body = message.Body;
        const receiptHandle = message.ReceiptHandle;
        const pdr = JSON.parse(body);

        log.info(`Parsing ${pdr.name}`);

        // parse the body
        const parsed = await parsePdr(pdr.name);

        // detele message if parse successful
        if (parsed) {
          log.info(`deleting ${pdr.name} from the Queue`);
          await deleteMessage(process.env.PDRsQueue, receiptHandle);
        }
        else {
          log.error(`Parsing failed for ${pdr.name}`);
        }
      }
    }
    else {
      log.info('No new messages in the PDR queue');
    }
  }
  catch (e) {
    log.error(e);
    throw e;
  }
  finally {
    // make the function recursive
    pollPdrQueue();
  }
}


/**
 * Handler for starting a SQS poll for granules that has to ingested
 * This function runs pollGranulesQueue indefinitely until cancelled
 *
 * @param {object} event AWS Lambda uses this parameter to
 * pass in event data to the handler
 * @return {undefined}
 */
export function ingestGranulesHandler(event) {
  pollGranulesQueue();
}


/**
 * Handler for starting a SQS poll for PDRs
 * This function runs pollPdrQueue indefinitely until cancelled
 *
 * @param {object} event AWS Lambda uses this parameter to
 * pass in event data to the handler
 * @return {undefined}
 */
export function parsePdrsHandler(event) {
  pollPdrQueue();
}


/**
 * Handler for discovering and syncing latest PDRs.
 * The handler is invoked by a Lambda function.
 *
 * The event object (payload) must include the endpoint for the
 * function to check
 * @param {pdrHandlerEvent} event AWS Lambda uses this parameter to
 * pass in event data to the handler
 * @param {object} context
 * {@link http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html|AWS Lambda's context object}
 * @param {function} cb {@link http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html#nodejs-prog-model-handler-callback|AWS Lambda's callback}
 * @return {undefined}
 */
export async function discoverPdrHandler(event, context = () => {}, cb = () => {}) {
  try {
    // get the collectionName
    if (!event.hasOwnProperty('collectionName')) {
      return cb('you must provide collectionName in the event obj');
    }
    const collectionName = event.collectionName;

    // grab collectionName from the database
    const records = await query({
      TableName: process.env.CollectionsTable,
      KeyConditionExpression: 'collectionName = :name',
      ExpressionAttributeValues: {
        ':name': collectionName
      }
    });

    // make sure the record is found
    if (records.Count > 1) {
      log.error(records);
      return cb('More than one record is found');
    }
    else if (records.Count === 0) {
      return cb('No collection with the given name found');
    }
    const collection = records.Items[0];

    // get the endpoint from collection
    if (collection.ingest.type !== 'PDR') {
      return cb('This handle only support PDR ingest');
    }

    const endpoint = collection.ingest.config.endpoint;
    log.info(`checking ${endpoint}`);

    try {
      // first discover the PDRs
      const pdrs = await discoverPDRs(endpoint);
      for (const pdr of pdrs) {
        // check if PDR is already on S3
        // if not upload it, add it to DB and send to the queue
        const uploaded = await uploadIfNotFound(pdr.url, process.env.internal, pdr.name, 'pdrs');
        if (uploaded) {
          await uploadPdr(pdr);
        }
      }
      cb(null, `All PDRs ingested on ${Date()} for this endpoint: ${endpoint}`);
    }
    catch (e) {
      cb(e);
    }
  }
  catch (e) {
    log.error(e);
  }
}


// for local run: babel-node lambdas/pdr/index.js local
localRun(() => {
  // to test discoveringPDRs uncomment here
  //discoverPDRs('https://e4ftl01.cr.usgs.gov:40521/TEST_B/Cumulus/PDR/', (list) => console.log(list));

  // discover and upload new PDRs to S3
  //discoverPdrHandler(
    //{ endpoint: 'https://e4ftl01.cr.usgs.gov:40521/TEST_B/Cumulus/PDR/' },
    //null,
    //(err, r) => console.log(err, r)
  //);

  //uploadPdrs([{
    //name: 'PDN.ID1611071200.PDR',
    //url: 'https://e4ftl01.cr.usgs.gov:40521/TEST_B/Cumulus/PDR/PDN.ID1611071200.PDR'
  //}])

  //parsePdr('PDN.ID1611071200.PDR').then(() => console.log('done'));

  //receiveMessage(process.env.PDRsQueue).then((d) => console.log(d));

  //parsePdrsHandler();
  //pollGranulesQueue(3);

  //const queue = steed.queue(imageDownloadTask, 2)
  //queue.push(['this', 'that', 'what', 'sure'], (m) => console.log(m));

  discoverPdrHandler({collectionName: 'ASTER_1A_versionId_1'});
});


/**
 * @typedef {Object} pdrObject
 * @property {string} name pdr name
 * @property {string} url pdr url
 */
