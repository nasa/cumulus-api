'use strict';

import {
  sendMessage,
  receiveMessage,
  deleteMessage,
  query
} from 'cumulus-common/aws-helpers';
import { localRun } from 'cumulus-common/local';
import { Granule, Collection, Pdr } from 'cumulus-common/models';
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
export function discoverPDRs(endpoint) {
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
 * uploads a given PDR to S3 and adds it to DynamoDb and sends it to SQS
 * @param {pdrObject} pdr pdr object
 * @return {undefined}
 */
export async function uploadAddQueuePdr(pdr) {
  await syncUrl(pdr.url, process.env.internal, `pdrs/${pdr.name}`);
  log.info(`Uploaded ${pdr.name} to S3`);

  pdr.s3Uri = `s3://${process.env.internal}/pdrs/${pdr.name}`;

  // add the pdr to the queue
  // (we use queue here because we want to avoid DDOSing
  // providers
  await sendMessage(pdr, process.env.PDRsQueue);
  log.info(`Added ${pdr.name} to PDR queue`);

  // add the PDR to the table
  const pdrRecord = Pdr.buildRecord(pdr.name, pdr.url);
  pdrRecord.address = pdr.s3Uri;

  const pdrObj = new Pdr();
  await pdrObj.create(pdrRecord);

  log.info(`Saved ${pdr.name} to PDRsTable`);
}


/**
 * This async function parse a PDR stored on S3 and download all the files
 * in the PDR to a staging S3 bucket. The return is void.
 *
 * The function first download the PDR file from an ingest location to local disk.
 * It thn reads the file content and parse it.
 *
 * The function loops through the parsed PDR and identifies granules and associated files
 * in each object. The files are added to a separate queue for download and new granule records
 * are added to the GranuleTable on DynamoDB.
 *
 * @param {pdrObject} pdr the PDR on s3. The PDR must be on cumulus-internal/pdrs folder
 * @return {undefined}
 */
export async function parsePdr(pdr) {
  try {
    // first download the PDR
    await downloadS3Files(
      [{ Bucket: process.env.internal, Key: `pdrs/${pdr.name}` }],
      '.'
    );

    // then read the file and and pass it to parser
    const pdrFile = fs.readFileSync(pdr.name);
    const parsed = pvl.pvlToJS(pdrFile.toString());


    // Get all the file groups
    const fileGroups = parsed.objects('FILE_GROUP');

    // each group represents a Granule record.
    // After adding all the files in the group to the Queue
    // we create the granule record (moment of inception)
    for (const group of fileGroups) {
      // get all the file specs in each group
      const specs = group.objects('FILE_SPEC');

      const granuleFiles = [];

      // Add eachfile to the Queue to be downloaded
      for (const spec of specs) {
        const directoryId = spec.get('DIRECTORY_ID').value;
        const fileId = spec.get('FILE_ID').value;
        const fileUrl = url.resolve('https://e4ftl01.cr.usgs.gov:40521/', `${directoryId}/${fileId}`);

        const granuleFile = {
          fileUrl,
          fileId,
          concurrency: pdr.concurrency || 1,
          bucket: process.env.internal,
          key: 'staging'
        };

        // list of files for Granule class
        granuleFiles.push({
          file: fileUrl,
          name: fileId,
          type: 'sipFile'
        });

        await sendMessage(granuleFile, process.env.GranulesQueue);
      }

      // Find the granuleId
      // NOTE: In case of Aster, the filenames don't have the granuleId
      // For Aster, we temporarily use the granuleId in the XAR_ENTRY
      // section of the PDR
      const granuleId = group.objects('XAR_ENTRY')[0].get('GRANULE_ID').value;

      // build the granule record and add it to the database
      const granuleRecord = await Granule.buildRecord(
        pdr.collectionName,
        granuleId,
        granuleFiles
      );

      const g = new Granule();
      await g.create(granuleRecord);

      // add the granule to the PDR record
      const p = new Pdr();
      await p.addGranule(pdr.name, granuleId, false);
    }

    return true;
  }
  catch (e) {
    log.error(e.message, e.stack);
    return false;
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
 * The function is recursive and calls itself until terminated
 *
 * It receives the message(s) from PDRsQueue and send each message to `parsePdr` for parsing.
 * After successful execuation of `parsePdr`, the function deletes the message from the queue
 * and moves to the next message.
 *
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
  const numOfMessage = event.numOfMessage || 1;
  const visibilityTimeout = event.visibilityTimeout || 20;

  pollPdrQueue(numOfMessage, visibilityTimeout);
}


/**
 * Handler for discovering and syncing latest PDRs.
 * The handler is invoked by a Lambda function.
 *
 * The event object (payload) must include the endpoint for the
 * function to check
 * @param {object} event AWS Lambda uses this parameter to
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
    const c = new Collection();
    try {
      let collection = c.get({ collectionName: collectionName });
    }
    catch (e) {
      cb(e);
    }
        // get the endpoint from collection
    if (collection.ingest.type !== 'PDR') {
      return cb('This handle only support PDR ingest');
    }

    const endpoint = collection.ingest.config.endpoint;
    const concurrency = collection.ingest.config.concurrency || 1;
    log.info(`checking ${endpoint}`);

    try {
      // first discover the PDRs
      const pdrs = await discoverPDRs(endpoint);
      for (const pdr of pdrs) {
        // check if the PDR is in the database, if not add it and download
        // Note: if a PDR is already download but missing from the database, it will be
        // redownloaded
        records = await query({
          TableName: process.env.PDRsTable,
          KeyConditionExpression: 'pdrName = :name',
          ExpressionAttributeValues: {
            ':name': pdr.name
          }
        });

        if (records.Count === 0) {
          pdr.concurrency = concurrency;
          pdr.collectionName = collectionName;
          await uploadAddQueuePdr(pdr);
        }
        else {
          log.info(`${pdr.name} is already ingested`);
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

  //discoverPdrHandler({collectionName: 'ASTER_1A_versionId_1'});
  //

  //const pdrFile = fs.readFileSync('PDN.ID1611071200.PDR');
  //const parsed = pvl.pvlToJS(pdrFile.toString());
  //const fileGroups = parsed.objects('FILE_GROUP');
  //console.log(fileGroups[0].objects('XAR_ENTRY')[0].get('GRANULE_ID').value);
});


/**
 * @typedef {Object} pdrObject
 * @property {string} name pdr name
 * @property {string} url pdr url
 */
