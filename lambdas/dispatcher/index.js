'use strict';

import { Logger } from 'cumulus-common/log';
import { Granule } from 'cumulus-common/models';
import { SQS, invoke, S3 } from 'cumulus-common/aws-helpers';

const log = new Logger('lambdas/dispatcher/index.js');

export function handler(event, context, cb) {
  // recieve the payload
  // TODO: validate the payload
  const payload = event;
  const record = event.granuleRecord;
  const promises = [];

  log.info(`${record.granuleId}: Dispatcher launched`);

  // decide the next step
  const nextStep = payload.nextStep;
  const order = record.recipe.order[nextStep];

  if (order) {
    log.info(`Dispatcher is at step ${nextStep}`, record.granuleId);
  }
  else {
    log.info('Processing finished', record.granuleId);
  }

  // if process, send to SQS
  if (order === 'processStep') {
    // upload the payload to the S3 (needed because payload size)
    const key = `payloads/${Date.now()}.json`;
    await S3.put(
      process.env.internal,
      key,
      JSON.stringify(payload)
    );

    const msg = {
      payload: `s3://${process.env.internal}/${key}`,
      config: record.recipe[order]
    }
    // send messsage to SQS
    log.info('Queueing message for processing step', record.granuleId);
    promises.push(SQS.sendMessage(
      process.env.ProcessingQueue, msg
    ));
  }
  else {
    // if lambda, invoke it
    promises.push(invoke(process.env[order], payload));
  }

  // update the granule table
  const g = new Granule();
  promises.push(g.create(record));

  Promise.all(promises)
    .then(d => cb(null, d))
    .catch(e => {
      log.error(e, record.granuleId);
      cb(e);
    });
}
