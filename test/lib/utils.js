'use strict';
import assert from 'assert';
import { hashToId } from '../../lib/utils';

describe('utils', function () {
  describe('hashToId', function () {
    it('identifies table names', function (done) {
      assert.throws(() => hashToId('notARealTable'), /No dynamodb table config exists for ES_TYPE/);
      const record = {
        collectionName: 'foo',
        granuleId: 'bar'
      };
      const result = hashToId('x-GranulesTable', record);
      assert.equal(result, 'foo|bar');
      done();
    });
  });
});
