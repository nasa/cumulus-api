'use strict';
// the import below is needed to run the test
import assert from 'assert';
import { SQS } from '../aws-helpers';

describe('Testing AWS Helpers', () => {
  before(async () => {
    // IMPORTANT otherwise test tries to connect to AWS
    process.env.IS_LOCAL = true;

    // create Granule Queue
    process.env.GranulesQueue = 'GranuleTestQueue-aws-helpers';
    await SQS.createQueue(process.env.GranulesQueue);
  });

  it('getQueueUrl must return a valid SQS Url', async () => {
    const url = await SQS.getUrl(process.env.GranulesQueue);
    assert.equal(url, 'http://localhost:9324/queue/' + process.env.GranulesQueue);
  });

  it('getQueueUrl should return error if queue is not found', async () => {
    try {
      await SQS.getUrl('some queue');
    }
    catch (e) {
      assert.ok(e);
    }
  });

  after(async () => {
    // delete the queue
    await SQS.deleteQueue(process.env.GranulesQueue);
  });
});

