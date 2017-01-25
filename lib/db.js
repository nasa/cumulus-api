'use strict';

const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-west-2',
  endpoint: 'http://localhost:8000'
});

// Note, this is solely for ease of testing
let db;
function use () {
  db = new AWS.DynamoDB({
    apiVersion: '2012-08-10'
  });
  return db;
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
  db = db || use();
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
  db = db || use();
  return db.putItem(params, cb);
};
