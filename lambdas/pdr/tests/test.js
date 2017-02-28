'use strict';

// the import below is needed to run the test
import assert from 'assert';
import sinon from 'sinon';
import { SQS } from 'cumulus-common/aws-helpers';
import { Manager, Pdr, Granule, Collection } from 'cumulus-common/models';
import collectionRecord from 'cumulus-common/tests/data/collection.json';
import * as aws from 'gitc-common/aws';
import * as main from '../index';
import * as download from '../download';
import * as discover from '../discover';
import * as parse from '../parse';
import { testingServer } from './testServer';


describe('Testing PDRs', function() {
  // increase the timeout
  this.timeout(20000);

  before(async () => {
    process.env.IS_LOCAL = true;

    try {
      // create PDR table for testing
      const pdrTableName = 'PDRTestTable-pdrs';
      process.env.PDRsTable = pdrTableName;
      //await Manager.deleteTable(process.env.PDRsTable);
      await Manager.createTable(pdrTableName, { name: 'pdrName', type: 'S' });

      // Granule Table for Testing
      const granuleTableName = 'GranuleTestTable-pdrs';
      process.env.GranulesTable = granuleTableName;
      //await Manager.deleteTable(process.env.GranulesTable);
      await Manager.createTable(
        granuleTableName, {
          name: 'collectionName', type: 'S'
        }, {
          name: 'granuleId', type: 'S'
        }
      );


      // Collection table for testing
      const collectionTableName = 'CollectionTestTable-pdrs';
      process.env.CollectionsTable = collectionTableName;
      //await Manager.deleteTable(process.env.CollectionsTable);
      await Manager.createTable(
        collectionTableName, {
          name: 'collectionName', type: 'S'
        });

      // update ingest endpoint & add collection record
      const c = new Collection();
      collectionRecord.ingest.config.endpoint = 'http://localhost:3001/';
      await c.create(collectionRecord);

      // create PDR Queue
      process.env.PDRsQueue = 'PDRTestQueue-pdr';
      await SQS.createQueue(process.env.PDRsQueue);

      // create Granule Queue
      process.env.GranulesQueue = 'GranuleTestQueue-pdr';
      await SQS.createQueue(process.env.GranulesQueue);
    }
    catch (e) {
      console.log(e);
      throw e;
    }
  });

  it('test PDR discovery', (done) => {
    sinon.stub(aws, 'fileNotFound', () => true);
    const syncUrl = sinon.stub(aws, 'syncUrl');


    testingServer.start();

    main.discoverPdrHandler({ collectionName: collectionRecord.collectionName }, null, (err) => {
      if (err) done(err);
      try {
        assert.ok(syncUrl.callCount, 2);

        aws.fileNotFound.restore();
        aws.syncUrl.restore();

        testingServer.stop();
        done();
      }
      catch (e) {
        console.log(e);
        done(e);
      }
    });
  });

  it('test uploadIfNotFound when file is found', async () => {
    sinon.stub(aws, 'fileNotFound', () => false);

    const result = await download.uploadIfNotFound('example.com', 'bucket', 'file');
    assert.ok(!result);
    aws.fileNotFound.restore();
  });

  it('test uploadIfNotFound when file is not found', async () => {
    sinon.stub(aws, 'fileNotFound', () => true);
    const syncUrl = sinon.stub(aws, 'syncUrl');

    const result = await download.uploadIfNotFound('example.com', 'bucket', 'file');
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

    await discover.uploadAddQueuePdr(pdr);

    assert.ok(syncUrl.calledOnce);

    // check if the record is added to PDR table
    const p = new Pdr();
    const record = await p.get({ pdrName: pdr.name });
    assert.equal(record.pdrName, pdr.name);

    // check if message is added to the queue
    const messages = await SQS.receiveMessage(process.env.PDRsQueue, 3);
    assert.equal(messages.length, 3);

    aws.syncUrl.restore();
  });


  it('parsing should work', async () => {
    // mock download of the PDR from S3
    const downloadS3Files = sinon.stub(aws, 'downloadS3Files');

    const pdr = {
      name: 'lambdas/pdr/tests/data/PDN.ID1611081200.PDR',
      url: 'example.com/pdr',
      collectionName: collectionRecord.collectionName,
      concurrency: 1
    };

    // add a PDR record
    const p = new Pdr();
    const pRecord = Pdr.buildRecord(pdr.name, pdr.url);
    await p.create(pRecord);

    const g = new Granule();

    const success = await parse.parsePdr(pdr);

    assert.ok(success);
    assert.ok(downloadS3Files.calledOnce);

    const gs = await g.scan({});
    assert.equal(gs.Count, 4, '4 granules should be added to the database');

    // there has to 4  messages in the granule's queue
    const attr = await SQS.attributes(process.env.GranulesQueue);
    assert.equal(attr.ApproximateNumberOfMessages, 4, 'number of messages in the queue');

    // the PDR record must have 4 granules associated with it
    const granules = await g.scan({
      filter: 'pdrName = :value',
      values: {
        ':value': pdr.name
      }
    });

    assert.equal(granules.Items.length, 4);

    // all granules must have ingesting status
    granules.Items.forEach(item => {
      assert.equal(item.status, 'ingesting');
    });

    aws.downloadS3Files.restore();
  });

  it('test parsing PDR with invalid argument', async () => {
    const response = await parse.parsePdr({ name: 'somename' });
    assert.ok(!response);
  });

  it('test polling granule queue', async () => {
    // IMPORTANT: this test depends on the output of 'test parsing PDR'
    // the test fails if run alone

    sinon.stub(aws, 'fileNotFound', () => true);
    const syncUrl = sinon.stub(aws, 'syncUrl');

    // count the messages before
    let attr = await SQS.attributes(process.env.GranulesQueue);
    assert.equal(attr.ApproximateNumberOfMessages, 4);

    // test with concurrency of 2
    await download.pollGranulesQueue(2, 200, 8);

    // count the messages again
    attr = await SQS.attributes(process.env.GranulesQueue);
    assert.equal(parseInt(attr.ApproximateNumberOfMessages, 10), 0);

    // make sure syncUrl was called 8 times
    assert.equal(syncUrl.callCount, 8);

    aws.fileNotFound.restore();
    aws.syncUrl.restore();
  });

  after((done) => {
    setTimeout(async () => {
      // delete Queues
      await SQS.deleteQueue(process.env.PDRsQueue);
      await SQS.deleteQueue(process.env.GranulesQueue);

      // delete tables
      await Manager.deleteTable(process.env.PDRsTable);
      await Manager.deleteTable(process.env.GranulesTable);
      await Manager.deleteTable(process.env.CollectionsTable);

      done();
    }, 2000);
  });
});
