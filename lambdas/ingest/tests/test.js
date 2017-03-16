'use strict';

// the import below is needed to run the test
import os from 'os';
import assert from 'assert';
import sinon from 'sinon';
import { join } from 'path';
import { execSync } from 'child_process';
import { HttpPdrIngest, HttpGranuleIngest } from 'cumulus-common/ingest';
import { SQS } from 'cumulus-common/aws-helpers';
import { Manager, Pdr, Granule, Collection, Provider } from 'cumulus-common/models';
import providerRecord from 'cumulus-common/tests/data/provider.json';
import modisRecord from 'cumulus-common/tests/data/MYD13A1.006.json';
import collectionRecord from 'cumulus-common/tests/data/collection.json';
import * as aws from 'gitc-common/aws';
import { runActiveProviders } from '../discover';
import { pollPdrQueue } from '../parse';
import { pollGranulesQueue } from '../download';
import { testingServer } from './testServer';


// TODO: add tests for edge cases
describe('Testing PDRs', function() {
  // increase the timeout
  this.timeout(20000);

  before(async () => {
    process.env.IS_LOCAL = true;

    try {
      // create PDR table for testing
      const pdrTableName = 'PDRTestTable-ingest';
      process.env.PDRsTable = pdrTableName;
      //await Manager.deleteTable(process.env.PDRsTable);
      await Manager.createTable(pdrTableName, { name: 'pdrName', type: 'S' });

      // Granule Table for Testing
      const granuleTableName = 'GranuleTestTable-pdrs';
      process.env.GranulesTable = granuleTableName;
      //await Manager.deleteTable(process.env.GranulesTable);
      await Manager.createTable(
        granuleTableName, {
          name: 'granuleId', type: 'S'
        });

      // Provider table for testing
      const providerTableName = 'ProviderTableTest-ingest';
      process.env.ProvidersTable = providerTableName;
      //await Manager.deleteTable(process.env.ProvidersTable);
      await Manager.createTable(
        process.env.ProvidersTable, {
          name: 'name', type: 'S'
        });


      // Collection table for testing
      const collectionTableName = 'CollectionTestTable-ingest';
      process.env.CollectionsTable = collectionTableName;
      //await Manager.deleteTable(process.env.CollectionsTable);
      await Manager.createTable(
        collectionTableName, {
          name: 'collectionName', type: 'S'
        });

      // create a provider record
      const p = new Provider();
      providerRecord.host = 'http://localhost:3001/';
      providerRecord.path = '/';
      providerRecord.isActive = true;
      providerRecord.status = 'ingesting';
      await p.create(providerRecord);

      // update ingest endpoint & add provider record
      const c = new Collection();
      collectionRecord.providers = ['aster_test_endpoint'];
      await c.create(collectionRecord);

      // add modis record
      modisRecord.providers = ['aster_test_endpoint'];
      await c.create(modisRecord);

      // create PDR Queue
      process.env.PDRsQueue = 'PDRTestQueue-pdr';
      await SQS.createQueue(process.env.PDRsQueue);

      // create Granule Queue
      process.env.GranulesQueue = 'GranuleTestQueue-pdr';
      await SQS.createQueue(process.env.GranulesQueue);

      // starting the test server
      testingServer.start();
    }
    catch (e) {
      console.log(e);
      throw e;
    }
  });

  it('test PDR discovery', async () => {
    sinon.stub(HttpPdrIngest.prototype, '_sync').callsFake(() => 's3://file.txt');

    await runActiveProviders();

    // check if the PDRs are added to the table
    const p = new Pdr();
    let pdr = await p.get({ pdrName: 'PDN.ID1611071307.PDR' });
    assert.equal(pdr.status, 'discovered');

    // check a modis PDR
    pdr = await p.get({ pdrName: 'MYD13A1_5_grans.PDR' });
    assert.equal(pdr.status, 'discovered');
  });

  it('there must be two pdrs added to the table', async () => {
    const p = new Pdr();
    const pdrs = await p.scan({});
    assert.equal(pdrs.Count, 3);

    // two messages must be added to the PDR queue
    const attr = await SQS.attributes(process.env.PDRsQueue);
    assert.equal(attr.ApproximateNumberOfMessages, 3, 'number of messages in the queue');

    // restore the stub
    HttpPdrIngest.prototype._sync.restore();
  });

  it('10 granules should be added to the database', async () => {
    // there are two PDRs from the previous test in the queue.
    // we will only use one of them

    //mock download of the PDR from S3
    sinon.stub(aws, 'downloadS3Files');

    // copy pdrs to the temp directory
    execSync(
      `cp -r ${join(process.cwd(), 'lambdas/ingest/tests/data/*')} ${os.tmpdir()}`
    );

    // get all the 3 messages
    await pollPdrQueue(3, 20, 1, true);

    const g = new Granule();

    const gs = await g.scan({});
    assert.equal(gs.Count, 10, '10 granules should be added to the database');
  });

  it('there has to 10 messages in the granule\'s queue', async () => {
    const attr = await SQS.attributes(process.env.GranulesQueue);
    assert.equal(attr.ApproximateNumberOfMessages, 10, 'number of messages in the queue');
  });

  it('there has to 4 aster granules in the table', async () => {
    //// the PDR record must have 4 granules associated with it
    const g = new Granule();
    const granules = await g.scan({
      filter: 'pdrName = :value',
      values: {
        ':value': 'PDN.ID1611071307.PDR'
      }
    });

    assert.equal(granules.Items.length, 4);

    // all granules must have ingesting status
    granules.Items.forEach((item) => {
      assert.equal(item.status, 'ingesting');
    });
  });

  it('there has to 2 modis granules in the table', async () => {
    // run the same test for modis granules
    const g = new Granule();

    const granules = await g.scan({
      filter: 'pdrName = :value',
      values: {
        ':value': 'MYD13A1_5_grans.PDR'
      }
    });

    assert.equal(granules.Items.length, 2);

    // all granules must have ingesting status
    granules.Items.forEach((item) => {
      assert.equal(item.status, 'ingesting');
    });

    aws.downloadS3Files.restore();
  });

  it('test polling granule queue', async () => {
    // IMPORTANT: this test depends on the output of 'test parsing PDR'
    // the test fails if run alone
    const ingestFile = sinon.stub(HttpGranuleIngest.prototype, '_ingestFile')
                            .callsFake(() => {});

    // count the messages before
    let attr = await SQS.attributes(process.env.GranulesQueue);
    assert.equal(attr.ApproximateNumberOfMessages, '10');

    await pollGranulesQueue(10, 200, true);

    // count the messages again
    attr = await SQS.attributes(process.env.GranulesQueue);
    assert.equal(parseInt(attr.ApproximateNumberOfMessages, 10), 0);

    // make sure ingestFile was called 8 times
    assert.equal(ingestFile.callCount, 22);

    HttpGranuleIngest.prototype._ingestFile.restore();
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
      await Manager.deleteTable(process.env.ProvidersTable);

      // stopping the test server
      testingServer.stop();
      done();
    }, 2000);
  });
});
