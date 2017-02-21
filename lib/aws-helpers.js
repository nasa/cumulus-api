'use strict';
import AWS from 'aws-sdk';
import Logger from './log';

const log = new Logger('lib/aws-helpers.js');

/**
 * getEndpoint
 *
 * @param {boolean} [local] whether this is a local run
 * @param {number} [port=8000] port number defaults to 8000
 * @returns {object} the options for AWS service classes
 */
export function getEndpoint(local = false, port = 8000) {
  const args = {};
  if (process.env.IS_LOCAL === 'true' || local) {
    // use dummy access info
    AWS.config.update({
      accessKeyId: 'myKeyId',
      secretAccessKey: 'secretKey',
      region: 'us-east-1'
    });
    args.endpoint = new AWS.Endpoint(`http://localhost:${port}`);
    return args;
  }

  if (process.env.AWS_DEFAULT_REGION) {
    AWS.config.update({ region: process.env.AWS_DEFAULT_REGION });
  }

  return args;
}

export async function invoke(name, payload, type = 'Event') {
  if (process.env.IS_LOCAL) {
    log.info(`Faking Lambda invocation for ${name}`);
    return;
  }

  const lambda = new AWS.Lambda();

  const params = {
    FunctionName: name,
    Payload: JSON.stringify(payload),
    InvocationType: type
  };

  log.info(`invoked ${name}`);
  return await lambda.invoke(params).promise();
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
  return new AWS.DynamoDB.DocumentClient(getEndpoint(local, 8000));
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
  const response = await d.put(params).promise();

  return response;
}


/**
 * sqs class instance generator
 *
 * @param {boolean} local Whether this is a local call
 * @returns {object} Returns a instance of aws SQS class
 */
export function sqs(local) {
  return new AWS.SQS(getEndpoint(local, 9324));
}


export class S3 {
  static async copy(source, dstBucket, dstKey, isPublic = false) {
    const s3 = new AWS.S3();

    const params = {
      Bucket: dstBucket,
      CopySource: source,
      Key: dstKey,
      ACL: isPublic ? 'public-read' : 'private'
    };

    return await s3.copyObject(params).promise();
  }

  static async delete(bucket, key) {
    const s3 = new AWS.S3();

    const params = {
      Bucket: bucket,
      Key: key
    };

    return await s3.deleteObject(params).promise();
  }

  static async put(bucket, key, body, acl = 'private') {
    const s3 = new AWS.S3();

    const params = {
      Bucket: bucket,
      Key: key,
      Body: body,
      ACL: acl
    };

    return await s3.putObject(params).promise();
  }
}


export class SQS {
  static async createQueue(name) {
    const queue = sqs();
    const params = {
      QueueName: name
    };

    return await queue.createQueue(params).promise();
  }

  static async getUrl(name) {
    const queue = sqs();
    const url = await queue.getQueueUrl({ QueueName: name }).promise();
    return url.QueueUrl;
  }

  static async deleteQueue(name) {
    const url = await this.getUrl(name);

    const queue = sqs();
    const params = {
      QueueUrl: url
    };

    return await queue.deleteQueue(params).promise();
  }

  static async receiveMessage(name, numOfMessages = 1, timeout = 30) {
    const url = await this.getUrl(name);
    const queue = sqs();
    const params = {
      QueueUrl: url,
      AttributeNames: ['All'],
      VisibilityTimeout: timeout,
      MaxNumberOfMessages: numOfMessages
    };

    const messages = await queue.receiveMessage(params).promise();

    // convert body from string to js object
    if (messages.hasOwnProperty('Messages')) {
      messages.Messages.forEach((mes) => {
        mes.Body = JSON.parse(mes.Body);
      });

      return messages.Messages;
    }
    return [];
  }

  static async sendMessage(name, message) {
    let messageBody;
    if (typeof message === 'string') {
      messageBody = message;
    }
    else if (typeof message === 'object') {
      messageBody = JSON.stringify(message);
    }
    else {
      throw new Error('body type is not accepted');
    }

    const url = await this.getUrl(name);

    const params = {
      MessageBody: messageBody,
      QueueUrl: url
    };

    const queue = sqs();
    return await queue.sendMessage(params).promise();
  }

  static async deleteMessage(name, receiptHandle) {
    const url = await this.getUrl(name);
    const queue = sqs();
    const params = {
      QueueUrl: url,
      ReceiptHandle: receiptHandle
    };

    return await queue.deleteMessage(params).promise();
  }

  static async attributes(name) {
    const url = await this.getUrl(name);
    const queue = sqs();
    const params = {
      AttributeNames: ['All'],
      QueueUrl: url
    };

    const attr = await queue.getQueueAttributes(params).promise();
    return attr.Attributes;
  }
}

