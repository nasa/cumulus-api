'use strict';

// the import below is needed to run the test
import "babel-polyfill";
import assert from 'assert';
import { validate } from 'jsonschema';
import { granule as granuleSchema, pdr as pdrSchema } from '../../lib/schemas';
import collectionRecord from '../data/collection.json';
import granuleRecord from '../data/granule.json';
import pdrRecord from '../data/pdr.json';
import {
  Manager,
  Granule,
  Pdr,
  Collection,
  RecordDoesNotExist
} from '../../lib/models';

const tableName = 'cumulus-models-tests';
const testRecords = [{
  collectionName: 'myCollection',
  createdAt: Date.now()
}, {
  collectionName: 'myCollection2',
  createdAt: Date.now()
}];

describe('Testing Manager', () => {
  before(async () => {
    // IMPORTANT otherwise test tries to connect to AWS
    process.env.IS_LOCAL = true;

    // create a test table
    await Manager.createTable(tableName, { name: 'collectionName', type: 'S' });

    // add a test record
    const manager = new Manager(tableName);
    await manager.create(testRecords);
  });

  it('get should success when the record exists', async () => {
    const manager = new Manager(tableName);

    // check the item exist
    const item = await manager.get({collectionName: testRecords[0].collectionName});
    assert.ok(item);
    assert.equal(item.collectionName, testRecords[0].collectionName);

    // check if updatedAt is also added
    assert.ok(item.hasOwnProperty('updatedAt'));
  });

  it('get should fail if the record doesnt exist', async () => {
    const manager = new Manager(tableName);

    try {
      await manager.get({collectionName: 'something'});
    }
    catch (e) {
      assert.ok(e instanceof RecordDoesNotExist);
    }
  });

  it('list all records should return 2 records', async () => {
    const manager = new Manager(tableName);
    const list = await manager.scan({});

    assert.equal(list.Count, 2);
  });

  it('list records with search should return 1 record', async () => {
    const manager = new Manager(tableName);
    const list = await manager.scan({
      filter: 'collectionName = :name',
      values: {
        ':name': testRecords[0].collectionName
      }
    });

    assert.equal(list.Count, 1);
    assert.equal(list.Items[0].collectionName, testRecords[0].collectionName);
  });

  it('update existing record', async () => {
    const manager = new Manager(tableName);

    const record = await manager.update(
      { collectionName: testRecords[0].collectionName },
      { processedBy: 'a user' }
    );

    assert.ok(record);
    assert.ok(record.hasOwnProperty('processedBy'));
  });

  it('remove a key from the record', async () => {
    const manager = new Manager(tableName);

    let record = await manager.update(
      { collectionName: testRecords[0].collectionName },
      { someKey: 'a user' }
    );

    assert.ok(record.hasOwnProperty('someKey'));

    // now remove the key
    record = await manager.update(
      { collectionName: testRecords[0].collectionName },
      {},
      ['someKey']
    );

    assert.ok(!record.hasOwnProperty('someKey'));
  });

  it('delete a record', async () => {
    // delete testItem
    const manager = new Manager(tableName);
    for (const record of testRecords) {
      await manager.delete({collectionName: record.collectionName });
    }
  });

  after(async () => {
    // delete the table
    await Manager.deleteTable(tableName);
  });
});

describe('Test Collection model', () => {
  before(async () => {
    const collectionTableName = 'CollectionsTableForTesting';
    // set env variable for GranuleTable
    process.env.CollectionsTable = collectionTableName;

    // create the granule table
    await Manager.createTable(collectionTableName, { name: 'collectionName', type: 'S' });
  });

  it('add a record to collection table', async () => {
    const collection = new Collection();

    await collection.create(collectionRecord);

    // check if the record is added
    const c = await collection.get({ collectionName: collectionRecord.collectionName });
    assert.equal(c.collectionName, collectionRecord.collectionName);
  });

  after(async () => {
    // delete table
    await Manager.deleteTable(process.env.CollectionsTable);
  });
});

describe('Test Pdr model', () => {
  before(async () => {
    const tableName = 'PdrTableForTesting';
    // set env variable for GranuleTable
    process.env.PDRsTable = tableName;

    // create the granule table
    await Manager.createTable(tableName, { name: 'pdrName', type: 'S' });
  });

  it('add a record to pdr table', async () => {
    const pdr = new Pdr();

    await pdr.create(pdrRecord);

    // check if the record is added
    const c = await pdr.get({ pdrName: pdrRecord.pdrName });
    assert.equal(c.pdrName, pdrRecord.pdrName);
  });

  it('test buildRecord', async () => {
    const record = Pdr.buildRecord('somePDR', 'http://www.example.com');
    const validation = validate(record, pdrSchema);

    if (!validation.valid) {
      console.log(validation);
    }
    assert.ok(validation.valid);

    // add the record to the DB for the next test
    const p = new Pdr();
    await p.create(record);
  });

  it('add granule to existing PDR', async () => {
    const p = new Pdr();

    const record = await p.addGranule('somePDR', 'myspecialgranule', true);
    assert.ok(record.granules.myspecialgranule);
  });

  after(async () => {
    // delete table
    await Manager.deleteTable(process.env.PDRsTable);
  });
});



describe('Test Granule model', () => {
  before(async () => {
    const granuleTableName = 'GranuleTableForTesting';
    const collectionTableName = 'CollectionTableForTesting2';

    // set env variable for GranuleTable
    process.env.GranulesTable = granuleTableName;
    process.env.CollectionsTable = collectionTableName;

    // create the granule table
    await Manager.createTable(collectionTableName, { name: 'collectionName', type: 'S' });
    await Manager.createTable(granuleTableName, { name: 'granuleId', type: 'S' });
  });

  it('add a record to granule table', async () => {
    const granule = new Granule();

    await granule.create(granuleRecord)

    // check if the record is added
    const g = await granule.get({ granuleId: granuleRecord.granuleId });
    assert.equal(g.granuleId, granuleRecord.granuleId);
  });

  it('test buildRecord method for adding granule record', async () => {
    // add granule record to the database
    const c = new Collection();
    await c.create(collectionRecord);
    const granuleId = 'ASTL1A 1611040133141611079000';

    const files = [{
      file: 's3://cumulus-internal/staging/pg-BR1A0000-2016110701_000_001',
      type: 'stagingFile'
    }, {
      file: 'https://e4ftl01.cr.usgs.gov:40521/TEST_B/Cumulus/DATA/ID1611071200/pg-BR1A0000-2016110701_000_001',
      type: 'sipFile'
    }, {
      file: 's3://cumulus-internal/staging/pg-PR1A0000-2016110701_000_001',
      type: 'stagingFile'
    }, {
      file: 'https://e4ftl01.cr.usgs.gov:40521/TEST_B/Cumulus/DATA/ID1611071200/pg-PR1A0000-2016110701_000_001',
      type: 'sipFile'
    }];

    const record = await Granule.buildRecord(
      collectionRecord.collectionName,
      granuleId,
      files
    );

    const validation = validate(record, granuleSchema);

    if (!validation.valid) {
      console.log(validation);
    }
    assert.ok(validation.valid);
    assert.equal(record.collectionName, collectionRecord.collectionName);
    assert.equal(record.granuleId, granuleId);
    assert.deepEqual(record.recipe, collectionRecord.recipe);
  });

  after(async () => {
    // delete table
    await Manager.deleteTable(process.env.GranulesTable);
    await Manager.deleteTable(process.env.CollectionsTable);
  });
});
