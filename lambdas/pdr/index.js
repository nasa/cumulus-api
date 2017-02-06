'use strict';

import { sendMessage, receiveMessage, putItem } from 'cumulus-common/aws-helpers';
import { localRun } from 'cumulus-common/local';
import { syncUrl, downloadS3Files, fileNotFound } from 'gitc-common/aws';
import Crawler from 'simplecrawler';
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
      //throw 'error';

      // download each file spec
      for (const spec of specs) {
        const directoryId = spec.get('DIRECTORY_ID').value;
        const fileId = spec.get('FILE_ID').value;
        const fileUrl = url.resolve('https://e4ftl01.cr.usgs.gov:40521/', `${directoryId}/${fileId}`);

        // check if the file is already uploaded to S3
        // if not upload it
        await uploadIfNotFound(fileUrl, process.env.internal, fileId, 'staging');
      }
    }
  }
  catch (e) {
    log.error(e.message, e.stack);
  }
}


/**
 * Polls a SQS queue for PDRs that have to be parsed.
 * The function is recursive and calls itself for ever
 *
 */
function pollPdrQueue() {
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
export async function discoverPdrHandler(event, context, cb) {
  // get the endpoint from event
  const endpoint = event.endpoint;

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


// for local run: babel-node lambdas/pdr/index.js local
localRun(() => {
  // to test discoveringPDRs uncomment here
  //discoverPDRs('https://e4ftl01.cr.usgs.gov:40521/TEST_B/Cumulus/PDR/', (list) => console.log(list));

  // discover and upload new PDRs to S3
  //discoverpdrhandler(
    //{ endpoint: 'https://e4ftl01.cr.usgs.gov:40521/test_b/cumulus/pdr/' },
    //null,
    //(err, r) => console.log(err, r)
  //);

  //uploadPdrs([{
    //name: 'PDN.ID1611071200.PDR',
    //url: 'https://e4ftl01.cr.usgs.gov:40521/TEST_B/Cumulus/PDR/PDN.ID1611071200.PDR'
  //}])

  //parsePdr('PDN.ID1611071200.PDR').then(() => console.log('done'));

  receiveMessage(process.env.PDRsQueue).then((d) => console.log(d));

});


/**
 * @typedef {Object} pdrObject
 * @property {string} name pdr name
 * @property {string} url pdr url
 */
