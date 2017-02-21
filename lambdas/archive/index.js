'use strict';

import path from 'path';
import url from 'url';
import log from 'cumulus-common/log';
import payloadExample from 'cumulus-common/tests/data/payload.json';
import { S3 } from 'cumulus-common/aws-helpers';
import { localRun } from 'cumulus-common/local';


async function archive(file) {
  // only copy public and protected files
  // keep all the files in the staging folder (need to be moved later on)
  if (file.source) {
    let bucket;
    let isPublic = false;
    switch (file.status) {
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

    const p = url.parse(file.source);
    const filename = path.basename(p.path);

    log.debug(`${filename} copied`);
    await S3.copy(path.join(p.host, p.path), bucket, filename, isPublic);

    // delete the file from staging
    log.debug(`${file.source} deleted`);
    await S3.delete(p.host, p.path);
  }

  return;
}

export function handler(event, context, cb) {
  const files = event.granuleRecord.files;

  log.debug('recieved payload');
  // iterate over all files keys
  const fileList = Object.keys(files).map(k => {
    return {
      status: files[k].access,
      source: files[k].stagingFile
    };
  });

  log.debug('Started file copy');
  const promises = fileList.map(file => archive(file));

  Promise.all(promises)
  .then(() => {
    cb(null);
  }).catch(e => {
    log.error(e);
    log.error(e.stack);
    cb(e.stack);
  });
}

localRun(() => {
  handler(payloadExample, null, (e, r) => console.log(e, r));
});

