'use strict';

import AWS from 'aws-sdk';

// check if local used as an argument
const isLocal = process.argv[2] === 'local';

export function dynamodb(local) {
  const args = {};
  if (isLocal || local) {
    // use dummy access info
    AWS.config.update({
      accessKeyId: 'myKeyId',
      secretAccessKey: 'secretKey',
      region: 'us-east-1'
    });
    args.endpoint = new AWS.Endpoint('http://localhost:8000');
  }

  return new AWS.DynamoDB(args);
}

export async function query(params) {
  const d = dynamodb();
  const response = await d.query(params).promise();

  return response;
}

