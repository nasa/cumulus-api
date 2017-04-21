'use strict';

// the import below is needed to run the test
import test from 'ava';
import { SQS } from '../aws-helpers';

test.before(async () => {
  // IMPORTANT otherwise test tries to connect to AWS
  process.env.IS_LOCAL = true;

  // create Granule Queue
  process.env.GranulesQueue = 'GranuleTestQueue-aws-helpers';
  await SQS.createQueue(process.env.GranulesQueue);
});

test('getQueueUrl must return a valid SQS Url', async (t) => {
  const url = await SQS.getUrl(process.env.GranulesQueue);
  t.is(url, 'http://localhost:9324/queue/' + process.env.GranulesQueue);
});

test('getQueueUrl should return error if queue is not found', async (t) => {
  try {
    await SQS.getUrl('some queue');
  }
  catch (e) {
    t.truthy(e);
  }
});

test.after.always(async () => {
  // delete the queue
  await SQS.deleteQueue(process.env.GranulesQueue);
});

