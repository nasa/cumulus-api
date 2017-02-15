'use strict';

// the import below is needed to run the test
import 'babel-polyfill';
import assert from 'assert';
import sinon from 'sinon';
import { SQS } from 'cumulus-common/aws-helpers';
import { Manager, Pdr, Granule, Collection } from 'cumulus-common/models';
import collectionRecord from 'cumulus-common/tests/data/collection.json';
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
    //await Manager.deleteTable(process.env.PDRsTable);
    //await Manager.createTable(pdrTableName, { name: 'pdrName', type: 'S' });

    // Granule Table for Testing
    const granuleTableName = 'GranuleTestTable';
    process.env.GranulesTable = granuleTableName;
    //await Manager.deleteTable(process.env.GranulesTable);
    //await Manager.createTable(granuleTableName, { name: 'granuleId', type: 'S' });

    // Collection table for testing
    const collectionTableName = 'CollectionTestTable';
    process.env.CollectionsTable = collectionTableName;
    //await Manager.deleteTable(process.env.CollectionsTable);
    //await Manager.createTable(collectionTableName, { name: 'collectionName', type: 'S' });

    // add collection record
    const c = new Collection();
    await c.create(collectionRecord);

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

  //it('test parsing PDR', async () => {
    //// mock download of the PDR from S3
    //const downloadS3Files = sinon.stub(aws, 'downloadS3Files');

    //const pdr = {
      //name: 'PDN.ID1611081200.PDR',
      //uri: 'example.com/pdr',
      //collectionName: collectionRecord.collectionName,
      //concurrency: 1
    //};

    //// mock reading the S3 file from a test location
    //sinon.stub(fs, 'readFileSync', () => {
      //return fs.readFileSync('./data/PDN.ID1611081200.PDR');
    //});

    //const response = await parsePdr(pdr);

    //console.log(response);
  //});

  after(async () => {
    // delete Queues
    await SQS.deleteQueue(process.env.PDRsQueue);
    await SQS.deleteQueue(process.env.GranulesQueue);

    // delete tables
    console.log(process.env.GranulesTable);
    console.log(process.env.PDRsTable);
    console.log(process.env.CollectionsTable);
    //await Manager.deleteTable(process.env.PDRsTable);
    //await Manager.deleteTable(process.env.GranulesTable);
    //await Manager.deleteTable(process.env.CollectionsTable);
  });
});
