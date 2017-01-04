'use strict';

import { validate } from 'jsonschema';
import assert from 'assert';
import { collection } from '../lib/schemas';
import collectionRecord from './data/collection.json';

describe('Database Schema validators', () => {
  it('collection table record', () => {
    assert.ok(validate(collectionRecord, collection).valid);
  });
});
