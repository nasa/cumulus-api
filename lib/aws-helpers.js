'use strict';
import AWS from 'aws-sdk';

/**
 * getEndpoint
 *
 * @param {boolean} [local] whether this is a local run
 * @param {number} [port=8000] port number defaults to 8000
 * @returns {object} the options for AWS service classes
 */
function getEndpoint(local, port = 8000) {
  const args = {};
  if (process.env.IS_LOCAL || local) {
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


/**
 * dynamodb class instance generator
 * @example
 * // returns an instance of DynamoDB class
 * dynamodb(true)
 * @param {boolean} local Whether the dynamodb instance should connect to the local dynamoDB
 * @returns {object} Returns a instance of aws DynamoDB class
 */
export function dynamodb(local) {
  return new AWS.DynamoDB(getEndpoint(local, 8000));
}


/**
 * DynamoDb query helper
 * This is an async function
 *
 * @param {object} params DynamoDb query params {@link http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#query-property|aws ref}
 * @returns {Promise} an aws Promise {@link http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/using-promises.html|aws ref}
 */
export async function query(params) {
  const d = dynamodb();
  const response = await d.query(params).promise();

  return response;
}


/**
 * This is an async function.
 * DynamoDb putItem helper
 *
 * @param {object} params DynamoDb putItem params {@link http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#putItem-property|aws ref}
 * @returns {Promise} an aws Promise {@link http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/using-promises.html|aws ref}
 */
export async function putItem(params) {
  const d = dynamodb();
  const response = await d.putItem(params).promise();

  return response;
}


/**
 * sqs class instance generator
 *
 * @param {boolean} local Whether this is a local call
 * @returns {object} Returns a instance of aws DynamoDB class
 */
export function sqs(local) {
  return new AWS.SQS(getEndpoint(local, 9324));
}


/**
 * getQueueUrl
 *
 * @param {string} queueName SQS queue name
 * @returns {Promise} if successful returns SQS queue URL info as an object
 */
export async function getQueueUrl(queueName) {
  const queue = sqs();
  const url = await queue.getQueueUrl({ QueueName: queueName }).promise();
  return url;
}


/**
 * This is an async function.
 * Adds a message to a SQS queue. The message
 * is queued up to the local SQS is running locall
 * @param {(object|string)} body message body. If a JS object is passed it is stringified
 * @param {string} queueName the name of the sqs queue
 * @returns {Promise} an aws Promise {@link http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/using-promises.html|aws ref}
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

  const url = await getQueueUrl(queueName).QueueUrl

  const params = {
    MessageBody: messageBody,
    QueueUrl: await getQueueUrl(queueName).QueueUrl
  };

  const queue = sqs();
  return await queue.sendMessage(params).promise();
}


/**
 * Returns a SQS message
 *
 * @param {string} queueName SQS queue name
 * @param {number} [numOfMessage=1] Max number of messages to be returned by SQS
 * @param {number} [timeout=30] The duration (in seconds) that the received messages are hidden from subsequent retrieve requests
 * @returns {Promise} an aws Promise {@link http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/using-promises.html|aws ref}
 */
export async function receiveMessage(queueName, numOfMessage = 1, timeout = 30) {
  const url = await getQueueUrl(queueName);
  const queue = sqs();
  const params = {
    QueueUrl: url.QueueUrl,
    AttributeNames: ['All'],
    VisibilityTimeout: timeout,
    MaxNumberOfMessages: numOfMessage
  };

  return await queue.receiveMessage(params).promise();
}
