'use strict';

import log from 'cumulus-common/log';
import { get } from 'lodash';
import { S3 } from 'cumulus-common/aws-helpers';
import { localRun } from 'cumulus-common/local';
import { ingestGranule } from 'cumulus-common/cmrjs';
import { createErrorType } from 'ingest-common/errors';
import payloadExample from 'cumulus-common/tests/data/payload4.json';

/**
 * The error object for when the xml file path is not provided
 * @class
 */
const XmlMetaFileNotFound = createErrorType('XmlMetaFileNotFound');

const logDetails = {
  file: 'lambdas/cmrPush/index.js',
  source: 'pushToCMR',
  type: 'processing'
};


/**
 * getMetadata
 *
 * @param {string} xmlFilePath S3 URI to the xml metadata document
 * @returns {string} returns stringified xml document downloaded from S3
 */
export async function getMetadata(xmlFilePath) {
  // Identify the location of the metadata file,
  // conditional on the name of the collection

  if (!xmlFilePath) {
    throw new XmlMetaFileNotFound('XML Metadata file not provided');
  }

  // GET the metadata text
  // Currently, only supports files that are stored on S3
  const parts = xmlFilePath.match(/^s3:\/\/(.+?)\/(.+)$/);
  const obj = await S3.get(parts[1], parts[2]);

  log.info(`Downloaded meta xml file from ${xmlFilePath}`, logDetails);

  return obj.Body.toString();
}


/**
 * function for posting xml strings to CMR
 *
 * @param {string} xml The strigified xml document that has to be posted to CMR
 * @param {string} cmrProvider The name of of the CMR provider to be used
 * @returns {object} CMR's success response which includes the concept-id
 */
export async function postToCMR(xml, cmrProvider) {
  // TODO: pass the username and password provided by the payload
  // This requires some changes to how cmrjs is initialized and accesses credentials
  log.info('Pushing the metadata to CMR', logDetails);
  return ingestGranule(xml, cmrProvider);
}


/**
 * Lambda function handler
 *
 * @param {object} event Lambda function payload
 * @param {object} context aws lambda context object
 * @param {function} cb lambda callback
 * @returns {object} returns the updated event object
 */
export function handler(event, context, cb) {
  try {
    logDetails.collectionName = get(event, 'collection.id');
    logDetails.pdrName = get(event, 'payload.pdrName');
    logDetails.granuleId = get(event, 'payload.granuleId');
    const cmrProvider = get(event, 'collection.meta.cmrProvider', 'CUMULUS');
    const xmlFilePath = get(event, 'payload.files[\'meta-xml\']');

    if (!xmlFilePath) {
      const err = new XmlMetaFileNotFound('Staging XML File is missing');
      return cb(err);
    }

    log.debug(`Received a new payload: ${JSON.stringify(event)}`, logDetails);

    getMetadata(xmlFilePath).then(xml => postToCMR(xml, cmrProvider)).then((res) => {
      log.info(`successfully posted with this message: ${JSON.stringify(res)}`, logDetails);

      // add conceptId to the record
      event.payload.cmrLink = 'https://cmr.uat.earthdata.nasa.gov/search/granules.json' +
        `?concept_id=${res.result['concept-id']}`;
      event.payload.published = true;

      return event;
    }).then(res => cb(null, res))
      .catch(e => cb(e));
  }
  catch (e) {
    log.error(e, logDetails);
    cb(e);
  }
}


localRun(() => {
  handler(payloadExample, null, (e, r) => console.log(e, r));
});
