'use strict';

// the import below is needed to run the test
import 'babel-polyfill';
import assert from 'assert';
import sinon from 'sinon';
import { SQS } from 'cumulus-common/aws-helpers';
import { Manager, Pdr } from 'cumulus-common/models';
import {
  discoverPDRs,
  uploadIfNotFound,
  uploadAddQueuePdr,
  parsePdr
} from '../index';
import { testingServer } from './testServer';

// module to stub out
import fs from 'fs';
import * as aws from 'gitc-common/aws';

describe('Testing PDRs', () => {
  before(async () => {
    process.env.IS_LOCAL = true;

    // create PDR table for testing
    const pdrTableName = 'PDRTestTable';
    process.env.PDRsTable = pdrTableName;
    await Manager.createTable(pdrTableName, { name: 'pdrName', type: 'S' });

    // create PDR Queue
    process.env.PDRsQueue = 'PDRTestQueue';
    await SQS.createQueue(process.env.PDRsQueue);

    // create Granule Queue
    process.env.GranulesQueue = 'GranuleTestQueue';
    await SQS.createQueue(process.env.GranulesQueue);
  });

  it('test discover PDRs', (done) => {
    const testEndpoint = 'http://localhost:3001/';

    testingServer.start();

    discoverPDRs(testEndpoint).then((pdrs) => {
      assert.ok(pdrs instanceof Array);
      assert.equal(pdrs.length, 2);
      assert.ok(pdrs[0].hasOwnProperty('name'));
      assert.ok(pdrs[0].hasOwnProperty('url'));
      testingServer.stop();
      done();
    });
  });

  it('test uploadIfNotFound when file is found', async () => {
    sinon.stub(aws, 'fileNotFound', () => false);

    const result = await uploadIfNotFound('example.com', 'bucket', 'file');
    assert.ok(!result);
    aws.fileNotFound.restore();
  });

  it('test uploadIfNotFound when file is not found', async () => {
    sinon.stub(aws, 'fileNotFound', () => true);
    const syncUrl = sinon.stub(aws, 'syncUrl');

    const result = await uploadIfNotFound('example.com', 'bucket', 'file');
    assert.ok(result);
    assert.ok(syncUrl.calledOnce);

    aws.fileNotFound.restore();
    aws.syncUrl.restore();
  });

  it('test uploading and adding PDR to the queue', async () => {
    const syncUrl = sinon.stub(aws, 'syncUrl');
    const pdr = {
      name: 'myPdr',
      url: 'example.com/pdr'
    };

    await uploadAddQueuePdr(pdr);

    assert.ok(syncUrl.calledOnce);

    // check if the record is added to PDR table
    const p = new Pdr();
    const record = await p.get({ pdrName: pdr.name });
    assert.equal(record.pdrName, pdr.name);

    // check if message is added to the queue
    const messages = await SQS.receiveMessage(process.env.PDRsQueue);
    assert.equal(messages.length, 1);
    assert.deepEqual(messages[0].Body, pdr);

    // delete message
    await SQS.deleteMessage(process.env.PDRsQueue, messages[0].ReceiptHandle);

    aws.syncUrl.restore();
  });

  it('test parsing PDR', async () => {
    // mock download of the PDR from S3
    const downloadS3Files = sinon.stub(aws, 'downloadS3Files');

    // mock reading the S3 file from a test location
    sinon.stub(fs, 'readFileSync', () => {
      return fs.readFileSync('./data/PDN.ID1611081200.PDR');
    });



  });

  after(async () => {
    // delete PDR table
    await Manager.deleteTable(process.env.PDRsTable);

    // delete PDR Queue
    await SQS.deleteQueue(process.env.PDRsQueue);
  });
});
