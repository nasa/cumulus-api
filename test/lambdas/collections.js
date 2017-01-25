'use strict';

import assert from 'assert';
import sinon from 'sinon';
import { post } from '../../lambdas/collections';
import record from '../data/collection.json';
import * as  db from  '../../lib/db';

describe('Collections endpoint', () => {
  it('posts', (done) => {
    sinon.stub(db, 'get', (data, cb) => cb(false));
    sinon.stub(db, 'save', (data, cb) => cb('saved'));

    post(null, null, (resp) => {
      assert.ok(/invalid/.test(resp.toLowerCase()), 'returns error message with empty params');
    });

    post({body: record}, null, (error, resp) => {
      sinon.assert.calledOnce(db.get);

      assert.strictEqual(error, null);
      assert.equal(resp, 'saved');

      db.save.restore();
      db.get.restore();
      done();
    });
  });
});
