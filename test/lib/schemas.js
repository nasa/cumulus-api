'use strict';

import { validate } from 'jsonschema';
import assert from 'assert';
import { collection, granule, invoke, pdr, payload } from '../../lib/schemas';
import collectionRecord from '../data/collection.json';
import granuleRecord from '../data/granule.json';
import invokeRecord from '../data/invoke.json';
import pdrRecord from '../data/pdr.json';
import payloadRecord from '../data/payload.json';

describe('Database Schema validators', () => {
  it('collection table record', () => {
    assert.ok(validate(collectionRecord, collection).valid);
  });

  it('granule table record', () => {
    assert.ok(validate(granuleRecord, granule).valid);
  });

  it('invoke table record', () => {
    assert.ok(validate(invokeRecord, invoke).valid);
  });

  it('pdr table record', () => {
    assert.ok(validate(pdrRecord, pdr).valid);
  });

  it('payload object', () => {
    assert.ok(validate(payloadRecord, payload).valid);
  });
});
