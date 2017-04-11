'use strict';

import aws from 'aws-sdk';
import log from 'cumulus-common/log';
import { invoke } from 'cumulus-common/aws-helpers';
import { localRun } from 'cumulus-common/local';
import { ingestGranule } from 'cumulus-common/cmrjs';
import payloadExample from 'cumulus-common/tests/data/payload4.json';

const s3 = new aws.S3();
const logDetails = {
  file: 'lambdas/cmrPush/index.js',
  source: 'pushToCMR',
  type: 'processing'
};

export async function getMetadata(payload) {
  // Identify the location of the metadata file,
  // conditional on the name of the collection
  const filepath = payload.granuleRecord.files['meta-xml'].stagingFile;

  // GET the metadata text
  // Currently, only supports files that are stored on S3
  const parts = filepath.match(/^s3:\/\/(.+?)\/(.+)$/);
  const obj = await s3.getObject({
    Bucket: parts[1],
    Key: parts[2]
  }).promise();

  log.info(`Downloaded meta xml file from ${filepath}`, logDetails);

  return obj.Body.toString();
}


export async function postToCMR(xml, cmrProvider) {
  log.info('Pushing the metadata to CMR', logDetails);
  return ingestGranule(xml, cmrProvider);
}


export function handler(event, context, cb) {
  try {
    logDetails.collectionName = event.granuleRecord.collectionName;
    logDetails.pdrName = event.granuleRecord.pdrName;
    logDetails.granuleId = event.granuleRecord.granuleId;
    const cmrProvider = event.granuleRecord.cmrProvider || 'CUMULUS';

    log.debug(`Received a new payload: ${JSON.stringify(event)}`, logDetails);
    getMetadata(event).then(xml => postToCMR(xml, cmrProvider)).then((res) => {
      log.info(`successfully posted with this message: ${JSON.stringify(res)}`, logDetails);

      // add conceptId to the record
      event.granuleRecord.cmrLink = 'https://cmr.uat.earthdata.nasa.gov/search/granules.json' +
        `?concept_id=${res.result['concept-id']}`;
      event.granuleRecord.published = true;

      event.previousStep = event.nextStep;
      event.nextStep += 1;

      // invoking dispatcher
      return invoke(process.env.dispatcher, event);
    }).then(res => cb(null, res))
      .catch(e => cb(e));
  }
  catch (e) {
    log.error(e, logDetails);
    cb(e);
  }
  // url to check if the CMR is uploaded: https://cmr.uat.earthdata.nasa.gov/search/granules?granule_ur=[granuleUR from xml file]
}


localRun(() => {
  handler(payloadExample, null, (e, r) => console.log(e, r));
});
