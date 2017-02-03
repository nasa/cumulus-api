'use strict';

import { query, sendMessage, putItem } from 'cumulus-common/aws-helpers';
import { localRun } from 'cumulus-common/local';
import { syncUrl, downloadS3Files, s3 } from 'gitc-common/aws';
import Crawler from 'simplecrawler';
import url from 'url';
import log from 'gitc-common/log';
import steed from 'steed';
import pvl from 'pvl';
import fs from 'fs';

/**
 * discovers PDR names with a given url and returns
 * a list of PDRs
 * @param {string} endpoint url to the folder where PDRs are listed:
 * @param {discoverPDRsCallback} cb
 * @return {undefined}
 */
function discoverPDRs(endpoint, cb) {
  const pattern = /<a href="(PDN.*)">/;
  const c = new Crawler(endpoint);

  c.interval = 0;
  c.maxConcurrency = 10;
  c.respectRobotsTxt = false;
  c.userAgent = 'Cumulus';
  c.maxDepth = 1;

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

    cb(list);
  });

  c.start();
}

/**
 * checks if PDR lists are synced with DB
 * returns a list of new and existing PDRs
 * @param {Array<string>} pdrs An array of PDR strings
 * @return {pdrStatus} returns a list of PDRs under new and existing keys
 * @example
 * syncPdrsWithDb(['pdr1', 'pdr2'])
 * // returns
 * { new: ['pdr1'],
 *   existing: ['pdr2']}
 */
async function syncPdrsWithDb(pdrs) {
  const result = {
    new: [],
    existing: []
  };

  for (const pdr of pdrs) {
    const r = await query({
      TableName: 'PDRsTable',
      KeyConditionExpression: 'pdrName = :name',
      ExpressionAttributeValues: {
        ':name': {
          S: pdr.name
        }
      }
    });

    if (r.Count === 0) {
      result.new.push(pdr);
    }
    else {
      result.existing.push(pdr);
    }
  }

  log.info('Checked PDRs against the database to find new ones');
  return result;
}

/**
 * uploads a given list of PDR Urls to the correct S3 bucket
 * @param {Array<pdrStatus>} pdrs list of pdrs urls
 * @return {Promise} promise, to be resolved on success or rejected on failure
 */
function uploadPdrs(pdrs) {
  return new Promise((resolve, reject) => {
    // we download the PDRs in series to avoid
    // DDOSing DAACs uncomment next line if want to do parallel
    steed.each(pdrs, (pdr, cb) => {
    //steed.eachSeries(pdrs, (pdr, cb) => {
      log.info(`Uploading ${pdr.name} to S3`);
      syncUrl(pdr.url, 'cumulus-internal', `pdrs/${pdr.name}`).then(() => {
        // add the pdr to the queue
        // (we use queue here because we want to avoid DDOSing
        // providers
        log.info(`Adding ${pdr.name} to PDR queue`);
        sendMessage(pdr, 'testQueue1').then(() => {
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
                S: `s3://cumulus-internal/pdrs/${pdr.name}`
              }
            },
            TableName: process.env.PDRsTable
          };

          putItem(params, cb);
        });
      });
    }, (err) => {
      if (err) {
        log.error(err);
        reject(err);
      }
      else {
        log.info(`${pdrs.length} PDRs uploaded to S3`);
        resolve();
      }
    });
  });
}

/**
 * This async function parse a PDR stored on S3 and download all the files
 * in the PDR to a staging S3 bucket. The return is void
 * @param {string} pdrName name of the PDR on s3. The PDR must be on cumulus-internal/pdrs folder
 * @return {undefined}
 */
async function parsePdr(pdrName) {
  try {
    const s3Client = s3();
    // first download the PDR
    await downloadS3Files(
      [{ Bucket: 'cumulus-internal', Key: `pdrs/${pdrName}` }],
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
        try {
          await s3Client.headObject({
            Key: `staging/${fileId}`,
            Bucket: 'cumulus-internal'
          }).promise();
          log.info(`${fileId} is already ingested`);
        }
        catch (e) {
          // if file is not found download it
          if (e.stack.match(/(NotFound)/)) {
            log.info(`Uploading ${fileId} to S3`);
            await syncUrl(fileUrl, 'cumulus-internal', `staging/${fileId}`);
            log.info(`${fileId} uploaded`);
          }
        }
      }
    }
  }
  catch (e) {
    log.error(e.message, e.stack);
  }
}

//export function parsePdrsHandler(event, context, cb) {


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
export function discoverPdrHandler(event, context, cb) {
  // get the endpoint from event
  const endpoint = event.endpoint;

  // first discover the PDRs
  discoverPDRs(endpoint, (pdrs) => {
    // find which PDRs are new
    syncPdrsWithDb(pdrs).then((newPdrs) => {
      // upload new Pdrs
      uploadPdrs(newPdrs.new).then(() => {
        cb();
      });
    });
  });
}

// for local run: node dist/pdr local
localRun(() => {
  // to test discoveringPDRs uncomment here
  //discoverPDRs('https://e4ftl01.cr.usgs.gov:40521/TEST_B/Cumulus/PDR/', (list) => console.log(list));

  // discover and upload new PDRs to S3
  //discoverPdrHandler({ endpoint: 'https://e4ftl01.cr.usgs.gov:40521/TEST_B/Cumulus/PDR/' });

  //const loaded = loadCredentials();
  //console.log(loaded);


  //parsePdr('PDN.ID1611071200.PDR').then(() => console.log('done'));
});

/**
 * @callback discoverPDRsCallback
 * @param {Array<object>} list an array (list) of PDRs
 * @example
 * // Example of list
 * [{ name: 'pdr1', url: 'example.com' },
 *  { name: 'pdr2', url: 'example.com' }]
 */

/**
 * @typedef {Object} pdrStatus
 * @property {Array<string>} new list of new pdrs
 * @property {Array<string>} existing list of existing pdrs
 */
