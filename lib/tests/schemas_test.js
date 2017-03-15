'use strict';

import assert from 'assert';
import { Manager } from '../models';
import { collection, granule, invoke, pdr, payload, provider } from '../schemas';
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
