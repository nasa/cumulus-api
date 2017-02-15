'use strict';
import assert from 'assert';
import sinon from 'sinon';
import record from 'cumulus-common/tests/data/granule.json';
import * as es from 'cumulus-common/es';
import { list, get } from '../index';

describe('Granules endpoint', () => {
  it('lists', (done) => {
    const spy = sinon.spy((index, table, query, cb) => cb(null, []));
    sinon.stub(es, 'esQuery', spy);
    const query = {
      limit: 10,
      start_at: 100
    };
    list({ collectionName: 'foo', query }, null, (error, res) => {
      assert.ok(spy.calledOnce);
      assert.ok(spy.args[0][2].size === query.limit);
      assert.equal(res.length, 0);
      es.esQuery.restore();
      done();
    });
  });
});