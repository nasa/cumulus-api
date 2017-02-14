'use strict';

// the import below is needed to run the test
import 'babel-polyfill';
import assert from 'assert';
import { discoverPDRs } from '../index';
import { testingServer } from './testServer';

describe('Testing PDRs', () => {
  it('test discover PDRs', (done) => {
    const testEndpoint = 'http://localhost:3001/';

    testingServer.start();

    discoverPDRs(testEndpoint).then((pdrs) => {
      assert.ok(pdrs instanceof Array);
      assert.equal(pdrs.length, 2);
      assert.ok(pdrs[0].hasOwnProperty('name'));
      assert.ok(pdrs[0].hasOwnProperty('url'));
      testingServer.stop();
      done();
    });
  });
});
