'use strict';

import log from 'cumulus-common/log';
import { localRun } from 'cumulus-common/local';
import payloadExample from 'cumulus-common/tests/data/payload.json';
import { Granule } from 'cumulus-common/models';
import { SQS, invoke } from 'cumulus-common/aws-helpers';

const logDetails = {
  file: 'lambdas/dispatcher/index.js',
  type: 'processing',
  source: 'dispatcher'
};

class Dispatcher {
  constructor(payload) {
    this.payload = payload;
    this.record = payload.granuleRecord;
    this.nextStep = payload.nextStep;
    this.previousOrder = this.record.recipe.order[this.nextStep - 1];
    this.nextOrder = this.record.recipe.order[this.nextStep];

    logDetails.granuleId = this.record.granuleId;
    logDetails.collectionName = this.record.collectionName;

    log.info(`${this.record.granuleId}: Dispatcher launched`, logDetails);
    log.info(`Dispatcher is at step ${this.nextStep}`, logDetails);
    log.info(`Next step is ${this.nextOrder}`, logDetails);

    this.status = {
      processStep: 'processing',
      archive: 'archiving',
      pushToCMR: 'CMR'
    };
  }

  setDuration() {
    // if there is a previous step, calculate the duration
    if (this.previousOrder) {
      const duration = (
        this.record.timeline[this.previousOrder].endedAt -
        this.record.timeline[this.previousOrder].startedAt
      );

      this.record[`${this.previousOrder}Duration`] = duration || 0;
    }

    // if there is no order, set the duration for the processig
    // and the total duration
    if (!this.nextOrder) {
      const duration = (
        this.record.processingEndedAt -
        this.record.processingStartedAt
      );

      this.record.processingDuration = duration ? duration / 1000 : 0;
      this.record.duration = this.record.processingDuration + this.record.ingestDuration;

      log.info('Processing finished', logDetails);
      log.info(`Processing duration: ${this.record.duration}`, logDetails);
    }
  }

  setTime() {
    if (!this.record.hasOwnProperty('timeline')) {
      this.record.timeline = {};
      this.record.recipe.order.forEach(o => {
        this.record.timeline[o] = {};
      });
    }

    // if we are at step 0, seat the processing start time
    // this is for the whole processing portion of cumulus work
    if (this.nextStep === 0) {
      this.record.processingStartedAt = Date.now();
    }

    // if there is a previous order set the endtime for that order
    if (this.previousOrder) {
      this.record.timeline[this.previousOrder].endedAt = Date.now();
    }

    // if there is a nextStep, set starttime for the next step
    if (this.nextOrder) {
      // set start time
      this.record.timeline[this.nextOrder].startedAt = Date.now();
    }
    else {
      // if there is no next order, then we are at the end
      // of the processing time, so set the time endtime
      this.record.processingEndedAt = Date.now();
    }
  }

  setStatus() {
    if (this.nextOrder) {
      this.record.status = this.status[this.nextOrder];
    }
    else {
      this.record.status = 'completed';
    }
  }

  async launchNextStep() {
    this.record.updatedAt = Date.now();
    this.payload.granuleRecord = this.record;

    if (this.nextOrder) {
      if (this.nextOrder === 'processStep') {
        log.info('Sending processing message to ProcessingQueueu', logDetails);
        return await SQS.sendMessage(process.env.ProcessingQueue, this.payload);
      }
      log.info(`Invoking ${process.env[this.nextOrder]}`, logDetails);
      return await invoke(process.env[this.nextOrder], this.payload);
    }
    return 'No next step';
  }

  async updateRecord() {
    const g = new Granule();
    log.info('Granule record updated', logDetails);
    return await g.create(this.record);
  }

  dispatch(cb) {
    this.setTime();
    this.setDuration();
    this.setStatus();

    this.launchNextStep()
      .then(r => {
        console.log(r);
        return this.updateRecord();
      })
      .then((r) => {
        log.info('Dispatch completed', logDetails);
        cb(null, r);
      })
      .catch(e => cb(e));
  }
}


export function handler(event, context, cb) {
  // recieve the payload
  // TODO: validate the payload

  const d = new Dispatcher(event);
  d.dispatch(cb);
}

localRun(() => {
  handler(payloadExample, null, (e, r) => {
    console.log(e);
    console.log(r);
  });
});
