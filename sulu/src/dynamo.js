'use strict';

const AWS = require('aws-sdk');

/**
 * Adds a given record to a dynamodb table on AWS or local
 * @param {object} options commander cli options
 */
function addRecord(options) {
  const args = {};

  const local = options.local || false;
  const region = options.region || 'us-east-1';
  const tableName = options.table || null;
  const recordPath = options.record || null;
  const profile = options.profile || 'default';

  if (!tableName || !recordPath) {
    console.error('You must provide table and record info');
    return;
  }

  // if there is a local flag connect to local db
  if (local) {
    args.endpoint = new AWS.Endpoint('http://localhost:8000');
  }

  // set profile
  const credentials = new AWS.SharedIniFileCredentials({ profile: profile });
  AWS.config.credentials = credentials;
  AWS.config.update({ region: region });

  // read record
  const record = require(`../../${recordPath}`);
  const dynamodb = new AWS.DynamoDB.DocumentClient(args);

  const params = {
    TableName: tableName,
    Item: record
  };

  dynamodb.put(params, (err) => {
    if (err) {
      console.log(err);
      return;
    }

    console.log('record added successfully');
  });
}

module.exports.addRecord = addRecord;
