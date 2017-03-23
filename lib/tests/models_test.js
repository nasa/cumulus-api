'use strict';

// the import below is needed to run the test
import assert from 'assert';
import {
  granule as granuleSchema,
  pdr as pdrSchema,
  collection as collectionSchema
} from '../schemas';
import collectionRecord from './data/collection.json';
import granuleRecord from './data/granule.json';
import pdrRecord from './data/pdr.json';
import providerRecord from './data/provider.json';
import {
  Manager,
  Granule,
  Pdr,
  Collection,
  Provider,
  RecordDoesNotExist
} from '../models';

const tableName = 'cumulus-models-tests';
const testRecords = [{
  collectionName: 'myCollection',
  createdAt: Date.now()
}, {
  collectionName: 'myCollection2',
  createdAt: Date.now()
}];

describe('Testing Manager', function() {
  this.timeout(20000);

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
    const item = await manager.get({ collectionName: testRecords[0].collectionName });
    assert.ok(item);
    assert.equal(item.collectionName, testRecords[0].collectionName);

    // check if updatedAt is also added
    assert.ok(item.hasOwnProperty('updatedAt'));
  });

  it('get should fail if the record doesnt exist', async () => {
    const manager = new Manager(tableName);

    try {
      await manager.get({ collectionName: 'something' });
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
      await manager.delete({ collectionName: record.collectionName });
    }
  });

  after(async () => {
    // delete the table
    await Manager.deleteTable(tableName);
  });
});

describe('Test Collection and Provider model', () => {
  before(async () => {
    process.env.IS_LOCAL = true;

    const collectionTableName = 'CollectionsTableForTesting';
    // set env variable for CollectionTable
    process.env.CollectionsTable = collectionTableName;

    // create the collection table
    await Manager.createTable(collectionTableName, { name: 'collectionName', type: 'S' });

    // create the provider table
    const providerTableName = 'providerTableForTesting';
    process.env.ProvidersTable = providerTableName;
    await Manager.createTable(providerTableName, { name: 'name', type: 'S' });
  });

  it('add records to collection and provider tables', async () => {
    // provider and collection tables are dependent. When a record is added
    // to the collection table, it also updates the provider table.
    // When the collection record is updated or deleted, the same happens.
    // To test this, we first add a provider, then add the provider to the
    // collection table to see if the provider record is updated.
    // We will also the update and delete tasks
    const provider = new Provider();

    // add provider record
    await provider.create(providerRecord);

    // check if the record is added
    let p = await provider.get({ name: providerRecord.name });
    assert.equal(p.name, providerRecord.name);

    // create the collection record
    const collection = new Collection();

    collectionRecord.providers = ['aster_test_endpoint'];
    await collection.create(collectionRecord);

    // check if the record is added
    const c = await collection.get({ collectionName: collectionRecord.collectionName });
    assert.equal(c.collectionName, collectionRecord.collectionName);

    // check if the collection is added to the provider
    p = await provider.get({ name: providerRecord.name });
    assert.ok(p.regex[c.collectionName]);
  });

  it('delete collection record', async () => {
    // delete the collection record
    const collection = new Collection();

    await collection.delete({ collectionName: collectionRecord.collectionName });

    // check if the record exists
    try {
      await collection.get({ collectionName: collectionRecord.collectionName });
    }
    catch (e) {
      assert.ok(e instanceof RecordDoesNotExist);
    }

    // make sure regex def is removed from the PDR
    const provider = new Provider();
    const p = await provider.get({ name: collectionRecord.providers[0] });
    assert.ok(!p.regex.hasOwnProperty(collectionRecord.collectionName));
  });

  it('validation should fail when files keys are invalid', () => {
    const files = collectionRecord.granuleDefinition.files;
    collectionRecord.granuleDefinition.files = {};
    assert.throws(() => Collection.recordIsValid(testRecord, collectionSchema));

    // put back the files (for other tests to pass)
    collectionRecord.granuleDefinition.files = files;
  });

  after(async () => {
    // delete tables
    await Manager.deleteTable(process.env.CollectionsTable);
    await Manager.deleteTable(process.env.ProvidersTable);
  });
});

describe('Test Pdr model', () => {
  before(async () => {
    process.env.IS_LOCAL = true;

    // set env variable for GranuleTable
    process.env.PDRsTable = 'PdrTableForTesting';

    // create the granule table
    await Manager.createTable(process.env.PDRsTable, { name: 'pdrName', type: 'S' });
  });

  it('add a record to pdr table', async () => {
    const pdr = new Pdr();

    await pdr.create(pdrRecord);

    // check if the record is added
    const c = await pdr.get({ pdrName: pdrRecord.pdrName });
    assert.equal(c.pdrName, pdrRecord.pdrName);
  });

  it('test buildRecord', async () => {
    const record = Pdr.buildRecord('somePDR', 'someprovider', 'http://www.example.com');

    // validate
    Manager.recordIsValid(record, pdrSchema);

    // add the record to the DB for the next test
    const p = new Pdr();
    await p.create(record);
  });

  after(async () => {
    // delete table
    await Manager.deleteTable(process.env.PDRsTable);
  });
});


describe('Test Granule model', () => {
  before(async () => {
    process.env.IS_LOCAL = true;

    const granuleTableName = 'GranuleTableForTesting';
    const collectionTableName = 'CollectionTableForTesting2';

    // set env variable for GranuleTable
    process.env.GranulesTable = granuleTableName;
    process.env.CollectionsTable = collectionTableName;

    // create the granule table
    await Manager.createTable(collectionTableName, { name: 'collectionName', type: 'S' });
    await Manager.createTable(granuleTableName, { name: 'granuleId', type: 'S' });

    // create the provider table
    const providerTableName = 'providerTableForTesting';
    process.env.ProvidersTable = providerTableName;
    await Manager.createTable(providerTableName, { name: 'name', type: 'S' });
  });

  it('add a record to granule table', async () => {
    const granule = new Granule();

    await granule.create(granuleRecord);

    // check if the record is added
    const g = await granule.get({ granuleId: granuleRecord.granuleId });
    assert.equal(g.granuleId, granuleRecord.granuleId);
  });

  it('test buildRecord method for adding granule record', async () => {
    // add granule record to the database
    const c = new Collection();

    // remove provider from the collection
    delete collectionRecord.providers;

    await c.create(collectionRecord);
    const granuleId = '1A0000-2016110701_000_001';

    const files = [{
      url: 's3://cumulus-internal/staging/pg-BR1A0000-2016110701_000_001',
      filename: 'pg-BR1A0000-2016110701_000_001'
    }, {
      url: 's3://cumulus-internal/staging/pg-PR1A0000-2016110701_000_001',
      filename: 'pg-PR1A0000-2016110701_000_001'
    }];

    const record = await Granule.buildRecord(
      collectionRecord.collectionName,
      'pdrRecord',
      granuleId,
      files
    );

    Manager.recordIsValid(record, granuleSchema);

    assert.equal(record.collectionName, collectionRecord.collectionName);
    assert.equal(record.granuleId, granuleId);
    assert.deepEqual(record.recipe, collectionRecord.recipe);
  });

  after(async () => {
    // delete table
    await Manager.deleteTable(process.env.GranulesTable);
    await Manager.deleteTable(process.env.CollectionsTable);
    await Manager.deleteTable(process.env.ProvidersTable);
  });
});
