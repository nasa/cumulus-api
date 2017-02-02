'use strict';

import AWS from 'aws-sdk';

// check if local used as an argument
const isLocal = process.argv[2] === 'local';

function getEndpoint(local, port = 8000) {
  const args = {};
  if (isLocal || local) {
    // use dummy access info
    AWS.config.update({
      accessKeyId: 'myKeyId',
      secretAccessKey: 'secretKey',
      region: 'us-east-1'
    });
    args.endpoint = new AWS.Endpoint(`http://localhost:${port}`);
  }

  return args;
}

export function dynamodb(local) {
  return new AWS.DynamoDB(getEndpoint(local, 8000));
}

export async function query(params) {
  const d = dynamodb();
  const response = await d.query(params).promise();

  return response;
}

export function sqs(local) {
  return new AWS.SQS(getEndpoint(local, 9324));
}

/*
* Adds a message to a SQS queue. The message
* is queued up to the local SQS is running locall
* @param [object|string] body message body. If a JS object is passed it is strigified
* @param [string] queueName the name of the sqs queue
*/
export async function sendMessage(body, queueName) {
  let messageBody;
  if (typeof body === 'string') {
    messageBody = body;
  }
  else if (typeof body === 'object') {
    messageBody = JSON.stringify(body);
  }
  else {
    throw new Error('body type is not accepted');
  }

  const queue = sqs();
  const queueUrl = await queue.getQueueUrl({ QueueName: queueName }).promise();

  const params = {
    MessageBody: messageBody,
    QueueUrl: queueUrl.QueueUrl
  };

  return await queue.sendMessage(params).promise();
}
