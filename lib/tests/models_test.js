'use strict';

import test from 'ava';

// the import below is needed to run the test
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

test.before(async () => {
  // IMPORTANT otherwise test tries to connect to AWS
  process.env.IS_LOCAL = true;

  // create a test table
  await Manager.createTable(tableName, { name: 'collectionName', type: 'S' });

  // add a test record
  const manager = new Manager(tableName);
  await manager.create(testRecords);

  process.env.CollectionsTable = tableName;

  // create the provider table
  const providerTableName = 'providerTableForTesting';
  process.env.ProvidersTable = providerTableName;
  await Manager.createTable(providerTableName, { name: 'name', type: 'S' });

  process.env.PDRsTable = 'PdrTableForTesting';
  // create the granule table
  await Manager.createTable(process.env.PDRsTable, { name: 'pdrName', type: 'S' });

  // set env variable for GranuleTable
  const granuleTableName = 'GranuleTableForTesting';
  process.env.GranulesTable = granuleTableName;
  // create the granule table
  await Manager.createTable(granuleTableName, { name: 'granuleId', type: 'S' });
});

test.after.always(async () => {
  // delete the table
  await Manager.deleteTable(tableName);
  await Manager.deleteTable(process.env.ProvidersTable);
  await Manager.deleteTable(process.env.PDRsTable);
  await Manager.deleteTable(process.env.GranulesTable);
});


test.serial('get should success when the record exists', async (t) => {
  const manager = new Manager(tableName);

  // check the item exist
  const item = await manager.get({ collectionName: testRecords[0].collectionName });
  t.truthy(item);
  t.is(item.collectionName, testRecords[0].collectionName);

  // check if updatedAt is also added
  t.true(item.hasOwnProperty('updatedAt'));
});

test.serial('get should fail if the record doesnt exist', async (t) => {
  const manager = new Manager(tableName);

  try {
    await manager.get({ collectionName: 'something' });
  }
  catch (e) {
    t.true(e instanceof RecordDoesNotExist);
  }
});

test.serial('list all records should return 2 records', async (t) => {
  const manager = new Manager(tableName);
  const list = await manager.scan({});

  t.is(list.Count, 2);
});

test.serial('list records with search should return 1 record', async (t) => {
  const manager = new Manager(tableName);
  const list = await manager.scan({
    filter: 'collectionName = :name',
    values: {
      ':name': testRecords[0].collectionName
    }
  });

  t.is(list.Count, 1);
  t.is(list.Items[0].collectionName, testRecords[0].collectionName);
});

test.serial('update existing record', async (t) => {
  const manager = new Manager(tableName);

  const record = await manager.update(
    { collectionName: testRecords[0].collectionName },
    { processedBy: 'a user' }
  );

  t.truthy(record);
  t.true(record.hasOwnProperty('processedBy'));
});

test.serial('remove a key from the record', async (t) => {
  const manager = new Manager(tableName);

  let record = await manager.update(
    { collectionName: testRecords[0].collectionName },
    { someKey: 'a user' }
  );

  t.true(record.hasOwnProperty('someKey'));

  // now remove the key
  record = await manager.update(
    { collectionName: testRecords[0].collectionName },
    {},
    ['someKey']
  );

  t.true(!record.hasOwnProperty('someKey'));
});

test.serial('delete a record', async (t) => {
  // delete testItem
  const manager = new Manager(tableName);
  for (const record of testRecords) {
    await manager.delete({ collectionName: record.collectionName });
  }
  t.pass();
});

test.serial('add records to collection and provider tables', async (t) => {
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
  t.is(p.name, providerRecord.name);

  // create the collection record
  const collection = new Collection();

  collectionRecord.providers = ['aster_test_endpoint'];
  await collection.create(collectionRecord);

  // check if the record is added
  const c = await collection.get({ collectionName: collectionRecord.collectionName });
  t.is(c.collectionName, collectionRecord.collectionName);

  // check if the collection is added to the provider
  p = await provider.get({ name: providerRecord.name });
  t.truthy(p.regex[c.collectionName]);
});

test.serial('delete collection record', async (t) => {
  // delete the collection record
  const collection = new Collection();

  await collection.delete({ collectionName: collectionRecord.collectionName });

  // check if the record exists
  try {
    await collection.get({ collectionName: collectionRecord.collectionName });
  }
  catch (e) {
    t.true(e instanceof RecordDoesNotExist);
  }

  // make sure regex def is removed from the PDR
  const provider = new Provider();
  const p = await provider.get({ name: collectionRecord.providers[0] });
  t.true(!p.regex.hasOwnProperty(collectionRecord.collectionName));
});

test.serial('validation should fail when files keys are invalid', (t) => {
  const files = collectionRecord.granuleDefinition.files;
  collectionRecord.granuleDefinition.files = {};
  t.throws(() => Collection.recordIsValid(collectionRecord, collectionSchema));

  // put back the files (for other tests to pass)
  collectionRecord.granuleDefinition.files = files;
});


test.serial('add a record to pdr table', async (t) => {
  const pdr = new Pdr();

  await pdr.create(pdrRecord);

  // check if the record is added
  const c = await pdr.get({ pdrName: pdrRecord.pdrName });
  t.is(c.pdrName, pdrRecord.pdrName);
});

test.serial('test buildRecord', async (t) => {
  const record = Pdr.buildRecord('somePDR', 'someprovider', 'http://www.example.com');

  // validate
  Manager.recordIsValid(record, pdrSchema);

  // add the record to the DB for the next test
  const p = new Pdr();
  await p.create(record);
  t.pass();
});


test.serial('add a record to granule table', async (t) => {
  const granule = new Granule();

  await granule.create(granuleRecord);

  // check if the record is added
  const g = await granule.get({ granuleId: granuleRecord.granuleId });
  t.is(g.granuleId, granuleRecord.granuleId);
});

test.serial('test buildRecord method for adding granule record', async (t) => {
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
    files,
    'someprovider'
  );

  Manager.recordIsValid(record, granuleSchema);

  t.is(record.collectionName, collectionRecord.collectionName);
  t.is(record.granuleId, granuleId);
  t.deepEqual(record.recipe, collectionRecord.recipe);
});
