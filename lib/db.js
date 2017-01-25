'use strict';
const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-west-2',
  endpoint: 'http://localhost:8000'
});

function newInstance () {
  return new AWS.DynamoDB({ apiVersion: '2012-08-10' });
}
const instance = newInstance();

// This function should *only* be called in automated tests.
// It lets us stub the AWS dynamoDB method by creating a new
// database instance for each query.
// In production, this would just be unnecessary overhead.
let useNewInstance = false;
export function __forceNewInstance__ () {
  useNewInstance = true;
}

export const get = function (params, cb) {
  params = params || {};
  if (!params.key || !params.value || !params.table) {
    let missing = ['key', 'value', 'table'].filter(d => !params[d]).join(', ');
    return cb(missing + ' not found in db#get params');
  }
  params = {
    Key: { [params.key]: params.value },
    TableName: params.table
  };
  const db = useNewInstance ? newInstance() : instance;
  return db.getItem(params, cb);
};

export const save = function (params, cb) {
  params = params || {};
  if (!params.data || !params.table) {
    let missing = ['data', 'table'].filter(d => !params[d]).join(', ');
    return cb(missing + ' not found in db#save params');
  }
  params = {
    ReturnValues: 'ALL_NEW',
    Item: params.data,
    TableName: params.table
  };
  const db = useNewInstance ? newInstance() : instance;
  return db.putItem(params, cb);
};

export const update = function (params, cb) {
  params = params || {};
  if (!params.data || !params.key || !params.value || !params.table) {
    let missing = ['data', 'key', 'value', 'table'].filter(d => !params[d]).join(', ');
    return cb(missing + ' not found in db#save params');
  }
  params = {
    ReturnValues: 'ALL_NEW',
    UpdateExpression: buildUpdateExpression(params.data),
    TableName: params.table,
    Key: { [params.key]: params.value }
  };
  const db = useNewInstance ? newInstance() : instance;
  return db.updateItem(params, cb);
};

function buildUpdateExpression (updates) {
  const expression = [];
  Object.keys(updates).forEach(key => {
    expression.push(`${key} = ${updates[key]}`);
  });
  return 'SET ' + expression.join(', ');
}
