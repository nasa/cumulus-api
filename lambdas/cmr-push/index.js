'use strict';

import aws from 'aws-sdk';
import log from 'cumulus-common/log';
import { localRun } from 'cumulus-common/local';
import { ingestGranule } from 'cumulus-common/cmrjs';
import payloadExample from 'cumulus-common/tests/data/payload.json';

const s3 = new aws.S3();

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

  log.debug(`Downloaded meta xml file from ${filepath}`);

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
  log.debug('Pushing the metadata to CMR');
  return await ingestGranule(xml);
}


export function handler(event, context, cb) {
  log.debug(`Received a new payload: ${JSON.stringify(event)}`);
  getMetadata(event).then(xml => {
    const payload = formatMetadata(event, xml);
    return postToCMR(payload);
  }).then(res => {
    log.debug(`successfully posted with this message: ${JSON.stringify(res)}`);
    cb(null, res);
  }).catch(e => cb(e));

  // url to check if the CMR is uploaded: https://cmr.uat.earthdata.nasa.gov/search/granules?granule_ur=[granuleUR from xml file]
}


localRun(() => {
  handler(payloadExample, null, (e, r) => console.log(e, r));
});
