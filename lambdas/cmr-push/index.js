'use strict';

import aws from 'aws-sdk';
import { ingestGranule } from 'cmrjs';

const s3 = new aws.S3();

const identifyCollection = (payload) => {
  return payload.granuleRecord.collectionName;
};

export const getMetadata = (payload, cb) => {
  // Identify the location of the metadata file,
  // conditional on the name of the collection
  let filepath;
  const collection = identifyCollection(payload);
  if (collection === 'AST_L1A') {
    const xmlFile = Object.keys(payload.granuleRecord.files).find(f => f.endsWith('.xml'));
    filepath = payload.granuleRecord.files[xmlFile].archivedFile;
  } else {
    return cb(new Error("CMR pusher doesn't know how to extract metadata for this collection"));
  }

  // GET the metadata text
  // Currently, only supports files that are stored on S3
  const parts = filepath.match(/^s3:\/\/(.+?)\/(.+)$/);
  s3.getObject({
    Bucket: parts[1],
    Key: parts[2]
  }, (err, xml) => cb(err, xml ? xml.Body.toString() : null));
};

export const formatMetadata = (payload, xml) => {
  // Format the metadata so that it is compliant with the ECHO-10 XML format
  const collection = identifyCollection(payload);
  if (collection === 'AST_L1A') {
    // ASTER data isn't in complaint ECHO-10 format
    // But for now we'll just pass it through
    return xml;
  } else {
    // By default, we'll assume that the xml string is ready to go
    return xml;
  }
};

export const postToCMR = (xml, cb) => {
  ingestGranule(xml, (err, res) => cb(err, res));
};

export const handler = (event, context, cb) => {
  getMetadata(event, (err, xml) => {
    if (err) { return cb(err); }
    postToCMR(formatMetadata(xml), (err, res) => cb(err, res));
  });
};


// To run a small test:
// babel-node index.js local
const { setupLocalRun } = require('cumulus-common/local');

setupLocalRun(handler, {
  granuleRecord: {
    collectionName: 'AST_L1A',
    files: {
      'foo.xml': {
        archivedFile: 's3://cumulus-internal/testdata/metadata/test-granule.xml'
      }
    }
  }
}, (e, r) => console.log(e, r));
