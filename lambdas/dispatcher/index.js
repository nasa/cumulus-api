'use strict';

import log from 'cumulus-common/log';
import { localRun } from 'cumulus-common/local';
import payloadExample from 'cumulus-common/tests/data/payload3.json';
import { Granule } from 'cumulus-common/models';
import { SQS, invoke, S3 } from 'cumulus-common/aws-helpers';

const logDetails = {
  file: 'lamgdas/dispatcher/index.js',
  type: 'processing',
  source: 'dispatcher'
};

function setDuration(record, previousOrder) {
  if (previousOrder) {
    record.timeline[previousOrder].ended = Date.now();

    const duration = (
      record.timeline[previousOrder].ended -
      record.timeline[previousOrder].started
    );

    record[`${previousOrder}Duration`] = duration || 0;
  }

  return record;
}

export function handler(event, context, cb) {
  // recieve the payload
  // TODO: validate the payload

  const payload = event;
  let record = event.granuleRecord;
  let invokeFunc;
  logDetails.granuleId = record.granuleId;
  logDetails.collectionName = record.collectionName;

  log.info(`${record.granuleId}: Dispatcher launched`, logDetails);

  // decide the next step
  const nextStep = payload.nextStep;
  const previousOrder = record.recipe.order[nextStep - 1];
  const nextOrder = record.recipe.order[nextStep];

  if (nextStep === 0) {
    record.processingStarted = Date.now();
  }

  //
  // if record does not have timeline add it
  //
  if (record && !record.hasOwnProperty('timeline')) {
    record.timeline = {};
    record.recipe.order.forEach(o => {
      record.timeline[o] = {};
    });
  }

  //
  // add/update status
  //
  if (!record.hasOwnProperty('status') || record.status !== 'processing') {
    record.status = 'processing';
  }

  // set end time and duration for previous task
  record = setDuration(record, previousOrder);

  if (nextOrder) {
    log.info(`Dispatcher is at step ${nextStep}`, logDetails);
    log.info(`Next step is ${nextOrder}`, logDetails);

    // set start time
    record.timeline[nextOrder].started = Date.now();

    // if process, send to SQS
    if (nextOrder === 'processStep') {
      // if it is a processing step send it to sqs
      // also because the processing Step doesn't handle adding dates and times
      // to the payload, do it now.
      payload.granuleRecord = record;

      // //invokeFunc = invoke(process.env.holder, payload);
      invokeFunc = SQS.sendMessage(process.env.ProcessingQueue, payload);
    }
    else {
      // if lambda, invoke it
      invokeFunc = invoke(process.env[nextOrder], payload);
    }

    invokeFunc.then(() => {
      // update the granule table
      const g = new Granule();
      console.log(record);
      return g.create(record);
    }).then(r => {
      log.info('Granule record updated', logDetails);

      log.info('Dispatch completed', logDetails);
      cb(null, r);
    }).catch(e => {
      log.error(e, e.stack, logDetails);
      cb(e);
    });
  }
  else {
    record.status = 'completed';
    record.processingEnded = Date.now();

    record.duration = (
      record.processingEnded -
      record.processingStarted
    );

    if (!record.duration) record.duration = 0;

    log.info('Processing finished', logDetails);
    log.info(`Processing duration: ${record.duration}`, logDetails);

    const g = new Granule();
    console.log(record);
    g.create(record).then((r) => {
      log.info('Granule record updated', logDetails);
      log.info('Dispatch completed', logDetails);
      cb(null, r);
    }).catch(e => {
      log.error(e, e.stack, logDetails);
      cb(e);
    });
  }
}

localRun(() => {
  handler(payloadExample, null, (e, r) => {
    console.log(e);
    console.log(r);
  });
});
