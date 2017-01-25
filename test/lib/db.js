'use strict';
import assert from 'assert';
import sinon from 'sinon';
import { __forceNewInstance__, get, update } from '../../lib/db';

const AWS = require('aws-sdk');

function stubDb (methods) {
  const stub = () => true;
  Object.keys(methods).forEach(methodName => stub.prototype[methodName] = methods[methodName]);
  return stub;
}

describe('db', function () {

  __forceNewInstance__();

  it('validates get requests', function (done) {
    get(null, (err) => {
      assert.ok(/key, value, table/.test(err), 'validates request params');
      done();
    });
  });

  it('sets params on #get', function (done) {
    const stub = stubDb({
      getItem: (params, cb) => cb(null, params)
    });
    sinon.stub(AWS, 'DynamoDB', stub);
    const params = {
      key: 'key',
      value: 'value',
      table: 'table'
    };
    get(params, (error, res) => {
      assert.strictEqual(error, null);
      assert.deepEqual(res, {
        Key: { [params.key]: params.value },
        TableName: params.table
      });
      AWS.DynamoDB.restore();
      done();
    });
  });

  it('creates update expressions on #update', function (done) {
    const stub = stubDb({
      getItem: (params, cb) => cb(null, true),
      updateItem: (params, cb) => cb(null, params)
    });
    sinon.stub(AWS, 'DynamoDB', stub);
    const params = {
      key: 'key',
      value: 'value',
      table: 'table',
      data: {
        a: 'b'
      }
    };
    update(params, (error, res) => {
      assert.strictEqual(error, null);
      assert.equal(res.UpdateExpression, 'SET a = b');
      AWS.DynamoDB.restore();
      done();
    });
  });
});
