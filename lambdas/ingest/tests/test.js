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
import collectionRecord from 'cumulus-common/tests/data/collection.json';
import { runActiveProviders } from '../discover';
import { pollPdrQueue } from '../parse';
import { pollGranulesQueue } from '../download';
import * as aws from 'gitc-common/aws';
//import * as main from '../index';
//import * as download from '../download';
//import * as discover from '../discover';
//import * as parse from '../parse';
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
      const providerTableName = 'ProviderTableTest-ingest'
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

  it('test PDR discovery', async () => {
    sinon.stub(HttpPdrIngest.prototype, '_sync').callsFake(() => 's3://file.txt');

    // starting the test server
    testingServer.start();

    await runActiveProviders();

    // check if the PDRs are added to the table
    const p = new Pdr()
    const pdr = await p.get({ pdrName: 'PDN.ID1611071307.PDR' });
    assert.equal(pdr.status, 'discovered');

    // there must be two pdrs added to the table
    const pdrs = await p.scan({});
    assert.equal(pdrs.Count, 2);

    // two messages must be added to the PDR queue
    const attr = await SQS.attributes(process.env.PDRsQueue);
    assert.equal(attr.ApproximateNumberOfMessages, 2, 'number of messages in the queue');

    // stopping the test server
    testingServer.stop();

    // restore the stub
    HttpPdrIngest.prototype._sync.restore();
  });

  it('parsing should work', async () => {
    // there are two PDRs from the previous test in the queue.
    // we will only use one of them

    //mock download of the PDR from S3
    const downloadS3Files = sinon.stub(aws, 'downloadS3Files');

    // copy pdrs to the temp directory
    execSync(
      `cp -r ${join(process.cwd(), 'lambdas/ingest/tests/data/*')} ${os.tmpdir()}`
    );

    await pollPdrQueue(1, 20, 1, true);

    const g = new Granule();

    const gs = await g.scan({});
    assert.equal(gs.Count, 4, '4 granules should be added to the database');

    // there has to 4  messages in the granule's queue
    const attr = await SQS.attributes(process.env.GranulesQueue);
    assert.equal(attr.ApproximateNumberOfMessages, 4, 'number of messages in the queue');

    //// the PDR record must have 4 granules associated with it
    const granules = await g.scan({
      filter: 'pdrName = :value',
      values: {
        ':value': 'PDN.ID1611071307.PDR'
      }
    });

    assert.equal(granules.Items.length, 4);

    // all granules must have ingesting status
    granules.Items.forEach(item => {
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
    assert.equal(attr.ApproximateNumberOfMessages, 4);

    await pollGranulesQueue(1, 200, true);

    // count the messages again
    attr = await SQS.attributes(process.env.GranulesQueue);
    assert.equal(parseInt(attr.ApproximateNumberOfMessages, 10), 0);

    // make sure ingestFile was called 8 times
    assert.equal(ingestFile.callCount, 8);

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

      done();
    }, 2000);
  });
});
