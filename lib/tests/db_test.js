'use strict';
// the import below is needed to run the test
import assert from 'assert';
import sinon from 'sinon';
import { __forceNewInstance__, get, update, buildUpdateExpression } from '../db';

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
      get: (params, cb) => cb(null, params)
    });
    sinon.stub(AWS.DynamoDB, 'DocumentClient', stub);
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
      AWS.DynamoDB.DocumentClient.restore();
      done();
    });
  });

  it('creates update expressions on #update', function (done) {
    const stub = stubDb({
      get: (params, cb) => cb(null, true),
      update: (params, cb) => cb(null, params)
    });
    sinon.stub(AWS.DynamoDB, 'DocumentClient', stub);
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
      assert.equal(res.UpdateExpression, 'SET #0 = :0');
      AWS.DynamoDB.DocumentClient.restore();
      done();
    });
  });

  it('creates update expressions', function (done) {
    let updates = {
      foo: 'bar',
      x: {a: 1, b: 2}
    };
    const output = buildUpdateExpression(updates);
    assert.equal(output.UpdateExpression, 'SET #0 = :0, #1 = :1');
    assert.deepEqual(output.ExpressionAttributeNames, {
      '#0': 'foo',
      '#1': 'x'
    });
    assert.deepEqual(output.ExpressionAttributeValues, {
      ':0': 'bar',
      ':1': {a: 1, b: 2}
    });
    done();
  });
});
