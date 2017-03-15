'use strict';

import assert from 'assert';
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

describe('Database Schema validators', () => {
  it('collection table record', () => {
    Manager.recordIsValid(collectionRecord, collection);
  });

  it('test modis1', () => {
    Collection.recordIsValid(modis1, collection);
  });

  it('test modis2', () => {
    Collection.recordIsValid(modis2, collection);
  });

  it('test modis3', () => {
    Collection.recordIsValid(modis3, collection);
  });

  it('test modis4', () => {
    Collection.recordIsValid(modis4, collection);
  });

  it('make sure validation removes keys not defined by the schema', () => {
    // add a field that is not in the schema
    collectionRecord.project = 'cumulus';

    Manager.recordIsValid(collectionRecord, collection);
    assert.equal(collectionRecord.project, undefined);
  });

  it('collection invalid record table', () => {
    collectionRecord.collectionName = 123;
    assert.throws(() => Manager.recordIsValid(collectionRecord, collection));
  });

  it('granule table record', () => {
    Manager.recordIsValid(granuleRecord, granule);
  });

  it('invoke table record', () => {
    Manager.recordIsValid(invokeRecord, invoke);
  });

  it('pdr table record', () => {
    Manager.recordIsValid(pdrRecord, pdr);
  });

  it('payload object', () => {
    Manager.recordIsValid(payloadRecord, payload);
  });

  it('provider object', () => {
    Manager.recordIsValid(providerRecord, provider);
  });
});
