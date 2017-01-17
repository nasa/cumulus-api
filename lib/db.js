'use strict';

const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-west-2',
  endpoint: 'http://localhost:8000'
});

export const dynamodb = new AWS.DynamoDB({
  apiVersion: '2012-08-10'
})

export const get = function (params, cb) {
  params = Object.extend({
    RequestItems: {
      someKey: {
        Keys: []
      }
    }
  }, params);
  dynamodb.getItem(params, function (err, data) {
    if (err) {
      console.log(err, err.stack)
    } else {
      return cb(data)
    }
  })
};

export const save = function (params, cb) {
  params = Object.extend({
    Item: {
    },
    TableName: ''
  }, params);
  dynamodb.putItem(params, function (err, data) {
    if (err) {
      console.log(err, err.stack);
    } else {
      return cb(data);
    }
  });
};

export const update = function (params, cb) {
  params = Object.extend({
    Key: {
    },
    TableName: '',
  }, params);
  dynamodb.updateItem(params, function (err, data) {
    if (err) {
      console.log(err, err.stack);
    } else {
      return cb(data);
    }
  });
};
