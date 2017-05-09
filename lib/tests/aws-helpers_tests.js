/* aws-helpers tests that are not local are done here */

'use strict';

// the import below is needed to run the test
import test from 'ava';
import Mock from '../mock';
import { getEndpoint, invoke, S3, SQS, ECS, CloudWatch } from '../aws-helpers';

test.before(async () => {
  // IMPORTANT otherwise test tries to connect to AWS
  process.env.TEST_MODE = true;
});

test.after.always(async () => {
  process.env.TEST_MODE = false;
});

test.serial('getEndpoint with local should return an object AWS configs', (t) => {
  process.env.AWS_DEFAULT_REGION = 'someRegion';
  const e = getEndpoint(true);

  t.truthy(e);
  t.is(e.endpoint.hostname, 'localhost');
  t.is(e.endpoint.port, 8000);
});

test.serial('check getEndpoint port argument', (t) => {
  const e = getEndpoint(true, 9000);
  t.is(e.endpoint.port, 9000);
});

test.serial('invoke with real arguments should make a call to aws', async (t) => {
  const funcName = 'something';
  const payload = { testing: 'payload' };

  const mock = new Mock('Lambda');
  mock.add('invoke', true);
  mock.apply();

  t.true(await invoke(funcName, payload));
  t.is(mock.args.FunctionName, funcName);
  t.is(mock.args.Payload, JSON.stringify(payload));
  t.is(mock.args.InvocationType, 'Event');
  mock.restore();
});

test.serial('testing invoke with local argument', async (t) => {
  process.env.IS_LOCAL = 'true';
  await invoke('some func');
  t.pass();
  process.env.IS_LOCAL = null;
});

test.serial('getEndpoint without the flag should return empty', (t) => {
  const res = getEndpoint();
  t.is(Object.keys(res).length, 0);
});

test.serial('test parseS3Uri with error', (t) => {
  t.throws(() => S3.parseS3Uri('http:/example.com'), 'uri must be a S3 uri, e.g. s3://bucketname');
});

test.serial('test parseS3Uri with valid input', (t) => {
  const r = S3.parseS3Uri('s3://mybucket/mykey/myfile.txt');

  t.is(r.Bucket, 'mybucket');
  t.is(r.Key, '/mykey/myfile.txt');
});

test.serial('copy files on s3', async (t) => {
  const testBucket = 'myBucket';
  const testKey = 'myTestKey';
  const testSource = 'whatasource';
  const isPublic = false;

  const mock = new Mock('S3');
  mock.add('copyObject', true);
  mock.apply();

  t.true(await S3.copy(testSource, testBucket, testKey, isPublic));
  t.is(mock.args.Bucket, testBucket);
  t.is(mock.args.CopySource, testSource);
  t.is(mock.args.Key, testKey);
  t.is(mock.args.ACL, 'private');
  mock.restore();
});

test.serial('delete a file on s3', async (t) => {
  const testBucket = 'myBucket';
  const testKey = 'myTestKey';

  const mock = new Mock('S3');
  mock.add('deleteObject', true);
  mock.apply();

  t.true(await S3.delete(testBucket, testKey));
  t.is(mock.args.Bucket, testBucket);
  t.is(mock.args.Key, testKey);
  mock.restore();
});

test.serial('put a file on s3', async (t) => {
  const testBucket = 'myBucket';
  const testKey = 'myTestKey';
  const testBody = 'somebody';
  const testAcl = 'public';

  const mock = new Mock('S3');
  mock.add('putObject', true);
  mock.apply();

  t.true(await S3.put(testBucket, testKey, testBody, testAcl));
  t.is(mock.args.Bucket, testBucket);
  t.is(mock.args.Key, testKey);
  t.is(mock.args.Body, testBody);
  t.is(mock.args.ACL, testAcl);
  mock.restore();
});

test.serial('upload a file on s3', async (t) => {
  const testBucket = 'myBucket';
  const testKey = 'myTestKey';
  const testBody = 'somebody';
  const testAcl = 'public';

  const mock = new Mock('S3');
  mock.add('upload', true);
  mock.apply();

  t.true(await S3.upload(testBucket, testKey, testBody, testAcl));
  t.is(mock.args.Bucket, testBucket);
  t.is(mock.args.Key, testKey);
  t.is(mock.args.Body, testBody);
  t.is(mock.args.ACL, testAcl);
  mock.restore();
});

test.serial('test when file exists on s3', async (t) => {
  const testBucket = 'myBucket';
  const testKey = 'myTestKey';

  const mock = new Mock('S3');
  mock.add('headObject', true);
  mock.apply();

  t.true(await S3.fileExists(testBucket, testKey));
  t.is(mock.args.Bucket, testBucket);
  t.is(mock.args.Key, testKey);
  mock.restore();
});

test.serial('test when file does not exist on s3', async (t) => {
  const testBucket = 'myBucket';
  const testKey = 'myTestKey';

  const mock = new Mock('S3');
  mock.add('headObject', null, { stack: 'File NotFound' });
  mock.apply();

  t.false(await S3.fileExists(testBucket, testKey));
  t.is(mock.args.Bucket, testBucket);
  t.is(mock.args.Key, testKey);
  mock.restore();
});

test.serial('test creating a Queue on SQS', async (t) => {
  const testQueue = 'myQueue';

  const mock = new Mock('SQS');
  mock.add('createQueue', true);
  mock.apply();

  t.true(await SQS.createQueue(testQueue));
  t.is(mock.args.QueueName, testQueue);
  mock.restore();
});

test.serial('test getting Queue URL SQS', async (t) => {
  const testQueue = 'myQueue';

  const mock = new Mock('SQS');
  mock.add('getQueueUrl', { QueueUrl: 'example.com' });
  mock.apply();

  t.is(await SQS.getUrl(testQueue), 'example.com');
  t.is(mock.args.QueueName, testQueue);
  mock.restore();
});

test.serial('test deleting queue SQS', async (t) => {
  const testQueue = 'myQueue';

  const mock = new Mock('SQS');
  mock.add('getQueueUrl', { QueueUrl: 'example.com' });
  mock.add('deleteQueue', true);
  mock.apply();

  t.true(await SQS.deleteQueue(testQueue));

  t.is(mock.getArgs(1).QueueUrl, 'example.com');
  mock.restore();
});

test.serial('test receive message SQS', async (t) => {
  const testQueue = 'myQueue';
  const testMessage = { myMessage: 'is this' };

  const mock = new Mock('SQS');
  mock.add('getQueueUrl', { QueueUrl: 'example.com' });
  mock.add('receiveMessage', { Messages: [{ Body: JSON.stringify(testMessage) }] });
  mock.apply();

  const resp = await SQS.receiveMessage(testQueue);
  t.deepEqual(resp, [{ Body: testMessage }]);

  const args = mock.getArgs(1);
  t.is(args.VisibilityTimeout, 30);
  t.is(args.MaxNumberOfMessages, 1);
  mock.restore();
});

test.serial('test sening message to the queue SQS', async (t) => {
  const testQueue = 'myQueue';
  const message = { mymessage: 'is good' };

  const mock = new Mock('SQS');
  mock.add('getQueueUrl', { QueueUrl: 'example.com' });
  mock.add('sendMessage', true);
  mock.apply();

  // test with object
  t.true(await SQS.sendMessage(testQueue, message));
  t.is(mock.getArgs(1).MessageBody, JSON.stringify(message));

  // test with string
  t.true(await SQS.sendMessage(testQueue, JSON.stringify(message)));
  t.is(mock.getArgs(3).MessageBody, JSON.stringify(message));

  mock.restore();
});

test.serial('test deleting message from the queue SQS', async (t) => {
  const testQueue = 'myQueue';
  const receiptHandle = 'somereceipt';

  const mock = new Mock('SQS');
  mock.add('getQueueUrl', { QueueUrl: 'example.com' });
  mock.add('deleteMessage', true);
  mock.apply();

  t.true(await SQS.deleteMessage(testQueue, receiptHandle));

  t.is(mock.getArgs(1).ReceiptHandle, receiptHandle);
  mock.restore();
});

test.serial('test getting queue attributes SQS', async (t) => {
  const testQueue = 'myQueue';

  const mock = new Mock('SQS');
  mock.add('getQueueUrl', { QueueUrl: 'example.com' });
  mock.add('getQueueAttributes', { Attributes: { name: testQueue } });
  mock.apply();

  const temp = await SQS.attributes(testQueue);
  t.is(temp.name, testQueue);

  mock.restore();
});

test.serial('ECS test describe cluster', async (t) => {
  const cluster = 'my test cluster';

  const mock = new Mock('ECS');
  mock.add('describeClusters', true);
  mock.apply();

  const ecs = new ECS(cluster);
  t.true(await ecs.describeCluster());

  t.is(mock.args.clusters[0], cluster);
  mock.restore();
});

test.serial('ECS list services', async (t) => {
  const cluster = 'my test cluster';

  const mock = new Mock('ECS');
  mock.add('listServices', true);
  mock.apply();

  const ecs = new ECS(cluster);
  t.true(await ecs.listServices());

  t.is(mock.args.cluster, cluster);
  mock.restore();
});

test.serial('ECS describe services', async (t) => {
  const cluster = 'my test cluster';
  const services = ['services1', 'services2'];

  const mock = new Mock('ECS');
  mock.add('describeServices', true);
  mock.apply();

  const ecs = new ECS(cluster);
  t.true(await ecs.describeServices(services));

  t.is(mock.args.cluster, cluster);
  t.is(mock.args.services, services);
  mock.restore();
});

test.serial('ECS list instances', async (t) => {
  const cluster = 'my test cluster';

  const mock = new Mock('ECS');
  mock.add('listContainerInstances', true);
  mock.apply();

  const ecs = new ECS(cluster);
  t.true(await ecs.listInstances());

  t.is(mock.args.cluster, cluster);
  mock.restore();
});

test.serial('ECS describe instances', async (t) => {
  const cluster = 'my test cluster';
  const instances = ['instance1', 'instance2'];

  const mock = new Mock('ECS');
  mock.add('describeContainerInstances', true);
  mock.apply();

  const ecs = new ECS(cluster);
  t.true(await ecs.describeInstances(instances));

  t.is(mock.args.cluster, cluster);
  t.is(mock.args.containerInstances, instances);
  mock.restore();
});

test.serial('CloudWatch bucketSize', async (t) => {
  const bucket = 'somebucket';
  const awsResponse = {
    ResponseMetadata: {
      RequestId: 'ede03d26-2914-11e7-b8a1-53c7ea9247b4'
    },
    Label: 'BucketSizeBytes',
    Datapoints: [{
      Timestamp: '2017-04-21T17:39:00.000Z',
      Sum: 4603890649171,
      Unit: 'Bytes'
    }, {
      Timestamp: '2017-04-19T17:39:00.000Z',
      Sum: 4292944830562,
      Unit: 'Bytes'
    }, {
      Timestamp: '2017-04-22T17:39:00.000Z',
      Sum: 4700349533314,
      Unit: 'Bytes'
    }, {
      Timestamp: '2017-04-23T17:39:00.000Z',
      Sum: 4809568606909,
      Unit: 'Bytes'
    }, {
      Timestamp: '2017-04-20T17:39:00.000Z',
      Sum: 4414604697845,
      Unit: 'Bytes'
    }]
  };

  const mock = new Mock('CloudWatch');
  mock.add('getMetricStatistics', awsResponse);
  mock.apply();

  const resp = await CloudWatch.bucketSize(bucket);
  t.is(resp.Sum, 4809568606909);
  t.is(resp.bucket, bucket);
  t.is(resp.Unit, 'Bytes');
  mock.restore();
});
