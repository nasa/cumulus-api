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


function identifyCollection(payload) {
  return payload.granuleRecord.collectionName;
}


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


export function formatMetadata(payload, xml) {
  // Format the metadata so that it is compliant with the ECHO-10 XML format
  const collection = identifyCollection(payload);
  if (collection === 'AST_L1A') {
    // ASTER data isn't in complaint ECHO-10 format
    // But for now we'll just pass it through
    return xml;
  }

  log.debug('Formatted metdata');
  // By default, we'll assume that the xml string is ready to go
  return xml;
}


export async function postToCMR(xml) {
  log.info('Pushing the metadata to CMR', logDetails);
  return await ingestGranule(xml);
}


export function handler(event, context, cb) {
  process.env.CMR_PROVIDER = event.granuleRecord.cmrProvider || 'CUMULUS';

  try {
    logDetails.collectionName = event.granuleRecord.collectionName;
    logDetails.granuleId = event.granuleRecord.granuleId;

    log.debug(`Received a new payload: ${JSON.stringify(event)}`, logDetails);
    getMetadata(event).then(xml => {
      const payload = formatMetadata(event, xml);
      return postToCMR(payload);
    }).then(res => {
      log.info(`successfully posted with this message: ${JSON.stringify(res)}`, logDetails);

      // add conceptId to the record
      event.granuleRecord.cmrLink = 'https://cmr.uat.earthdata.nasa.gov/search/granules.json' +
        `?concept_id=${res.result['concept-id']}`;

      event.previousStep = event.nextStep;
      event.nextStep += 1;

      // invoking dispatcher
      return invoke(process.env.dispatcher, event);
    }).then((res) => cb(null, res))
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
