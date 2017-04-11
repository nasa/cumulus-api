'use strict';

import path from 'path';
import url from 'url';
import log from 'cumulus-common/log';
import payloadExample from 'cumulus-common/tests/data/payload.json';
import { S3, invoke } from 'cumulus-common/aws-helpers';
import { localRun } from 'cumulus-common/local';

const logDetails = {
  file: 'lambda/archive/index.js',
  source: 'archiver',
  type: 'processing'
};

async function archive(files) {
  // only copy public and protected files
  // keep all the files in the staging folder (need to be moved later on)
  const newFiles = {};
  for (const element of Object.entries(files)) {
    const key = element[0];
    const file = element[1];
    if (file.stagingFile) {
      let bucket;
      let isPublic = false;
      switch (file.access) {
        case 'protected':
          bucket = process.env.protected;
          break;
        case 'public':
          bucket = process.env.public;
          isPublic = true;
          break;
        default:
          bucket = process.env.private;
          break;
      }

      const p = url.parse(file.stagingFile);
      const filename = path.basename(p.path);

      log.info(`${filename} copied`, logDetails);
      await S3.copy(path.join(p.host, p.path), bucket, filename, isPublic);

      // delete the file from staging
      const deleteInfo = S3.parseS3Uri(file.stagingFile);
      await S3.delete(deleteInfo.Bucket, deleteInfo.Key);
      log.info(`${file.stagingFile} deleted`, logDetails);

      file.archivedFile = `s3://${bucket}/${filename}`;
      file.name = filename;
    }

    newFiles[key] = file;
  }

  return newFiles;
}

export function handler(event, context, cb) {
  const files = event.granuleRecord.files;
  logDetails.granuleId = event.granuleRecord.granuleId;
  logDetails.pdrName = event.granuleRecord.pdrName;
  logDetails.collectionName = event.granuleRecord.collectionName;

  log.info('Started archiving', logDetails);
  log.debug('Started file copy', logDetails);

  archive(files).then((newFiles) => {
    log.info('All files archived', logDetails);

    event.previousStep = event.nextStep;
    event.nextStep += 1;

    event.granuleRecord.files = newFiles;
    return invoke(process.env.dispatcher, event);
  }).then((r) => {
    log.info('Invoked dispatcher', logDetails);
    cb(null, r);
  }).catch((e) => {
    log.error(e, e.stack, logDetails);
    cb(e.stack);
  });
}

localRun(() => {
  handler(payloadExample, null, (e, r) => console.log(e, r));
});

