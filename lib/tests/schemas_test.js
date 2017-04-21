'use strict';

import test from 'ava';

import { Manager, Collection } from '../models';
import { collection, granule, invoke, pdr, payload, provider } from '../schemas';
import modis1 from './data/MOD09GQ.006.json';
import modis2 from './data/MOD14A1.006.json';
import modis3 from './data/MYD09A1.006.json';
import modis4 from './data/MYD13A1.006.json';
import collectionRecord from './data/collection.json';
import granuleRecord from './data/granule.json';
import invokeRecord from './data/invoke.json';
import pdrRecord from './data/pdr.json';
import payloadRecord from './data/payload.json';
import providerRecord from './data/provider.json';

test('Schema for collection record', (t) => {
  Manager.recordIsValid(collectionRecord, collection);
  t.pass();
});

test('test modis1', (t) => {
  Collection.recordIsValid(modis1, collection);
  t.pass();
});

test('test modis2', (t) => {
  Collection.recordIsValid(modis2, collection);
  t.pass();
});

test('test modis3', (t) => {
  Collection.recordIsValid(modis3, collection);
  t.pass();
});

test('test modis4', (t) => {
  Collection.recordIsValid(modis4, collection);
  t.pass();
});

test('make sure validation removes keys not defined by the schema', (t) => {
  // add a field that is not in the schema
  collectionRecord.project = 'cumulus';

  Manager.recordIsValid(collectionRecord, collection, 'all');
  t.is(collectionRecord.project, undefined);
});

test('collection invalid record table', (t) => {
  const testRecord = Object.assign({}, collectionRecord);
  testRecord.collectionName = 123;
  t.throws(() => Manager.recordIsValid(testRecord, collection));
});

test('granule table record', (t) => {
  Manager.recordIsValid(granuleRecord, granule);
  t.pass();
});

test('invoke table record', (t) => {
  Manager.recordIsValid(invokeRecord, invoke);
  t.pass();
});

test('pdr table record', (t) => {
  Manager.recordIsValid(pdrRecord, pdr);
  t.pass();
});

test('payload object', (t) => {
  Manager.recordIsValid(payloadRecord, payload);
  t.pass();
});

test('provider object', (t) => {
  Manager.recordIsValid(providerRecord, provider);
  t.pass();
});
