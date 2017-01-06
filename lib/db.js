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
  const params = {
    RequestItems: {
      someKey: {
        Keys: []
      }
    }
  }
  dynamodb.getItem(params, function (err, data) {
    if (err) {
      console.log(err, err.stack)
    } else {
      return cb(data)
    }
  })
};
