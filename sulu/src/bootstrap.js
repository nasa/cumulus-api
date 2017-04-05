#! /usr/bin/env node

'use strict';

const envs = require('./envs');

const AWS = require('aws-sdk');
const elasticsearch = require('elasticsearch');
const httpAwsEs = require('http-aws-es');
const parseConfig = require('../src/common').parseConfig;

function getEs(cmd) {
  let credentials;
  let esConfig;

  // this is needed for getting temporary credentials from IAM role
  if (cmd === 'local') {
    esConfig = {
      host: 'localhost:9200'
    };
  }
  else if (cmd === 'remote') {
    credentials = new AWS.Credentials(
      process.env.AWS_ACCESS_KEY_ID,
      process.env.AWS_SECRET_ACCESS_KEY
    );

    esConfig = {
      host: process.env.ES_HOST || 'localhost:9200',
      connectionClass: httpAwsEs,
      amazonES: {
        region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
        credentials
      },

      // Note that this doesn't abort the query.
      requestTimeout: 50000  // milliseconds
    };
  }
  return new elasticsearch.Client(esConfig);
}

module.exports = function(cmd, options, deleteEs) {
  envs.apply(options.stage);
  const config = parseConfig(null, null, options.stage);

  if (cmd === 'local') {
    // use dummy access info
    AWS.config.update({
      accessKeyId: 'myKeyId',
      secretAccessKey: 'secretKey',
      region: 'us-east-1'
    });

    const dynamodb = new AWS.DynamoDB({
      endpoint: new AWS.Endpoint('http://localhost:8000')
    });

    // create DynamoDB Table
    config.dynamos.forEach((table) => {
      const params = {
        AttributeDefinitions: [],
        KeySchema: [],
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        },
        TableName: `${config.stackName}-${config.stage}-${table.name}`
      };

      table.attributes.forEach((attribute) => {
        params.AttributeDefinitions.push({
          AttributeName: attribute.name,
          AttributeType: attribute.type
        });
      });

      table.schema.forEach((schem) => {
        params.KeySchema.push({
          AttributeName: schem.name,
          KeyType: schem.type
        });
      });

      dynamodb.createTable(params, (err) => {
        if (err && err.stack.match(/(Cannot create preexisting table)/)) {
          console.log(`${params.TableName} is already created`);
          return;
        }
        console.log(`${params.TableName} created!`);
      });
    });

    // create SQS queues
    console.log('Creating SQS queues');
    const sqs = new AWS.SQS({
      endpoint: new AWS.Endpoint('http://localhost:9324')
    });

    config.sqs.forEach((queue) => {
      const queueName = `${config.stackName}-${config.stage}-${queue.name}`;

      const createQueue = () => sqs.createQueue({ QueueName: queueName }).promise();

      // get queue url (if any)
      sqs.getQueueUrl({ QueueName: queueName }).promise()
        .then((data) => {
          if (data.QueueUrl) {
            // delete the queue
            return sqs.deleteQueue({ QueueUrl: data.QueueUrl }).promise();
          }
        })
        .then((deleted) => {
          if (deleted) console.log(`${queueName} deleted`);
          return createQueue();
        })
        .then(data => console.log(data))
        .catch((e) => {
          if (e.code === 'AWS.SimpleQueueService.NonExistentQueue') {
            return createQueue().then(data => console.log(data)).catch(err => console.log(err));
          }
          console.log(e);
        });
    });
  }

  // run elasticsearch index creation on both local and remote modes
  const esClient = getEs(cmd);
  console.log('Bootstraping ElasticSearch');

  const mainIndex = `${config.stackName}-${config.stage}`;
  const logIndex = `${config.stackName}-${config.stage}-logs`;


  esClient.indices.exists({
    index: mainIndex
  }).then((exists) => {
    const addMapping = function() {
      const mappings = {};
      const es = config.elasticsearch;
      const dynamicTemplates = es.dynamic_templates;

      // add mapping and parent info for all dynamoDBs
      config.dynamos.forEach((d) => {
        const typeName = `${d.stackName}-${d.stage}-${d.name}`;
        mappings[typeName] = { dynamic_templates: dynamicTemplates };

        // add relation mappings
        if (es.relations.indexOf(d.name) > -1) {
          mappings[`${typeName}Granules`] = {
            _parent: {
              type: typeName
            },
            dynamic_templates: dynamicTemplates
          };
        }
      });

      console.log('Elasticsearch Main Index doesn\'t exist, creating it');
      return esClient.indices.create({
        index: mainIndex,
        body: { mappings }
      });
    };

    if (exists) {
      console.log('Elasticsearch main instance already created');
      if (deleteEs) {
        return esClient.indices.delete({ index: mainIndex }).then(() => addMapping());
      }
    }
    else {
      return addMapping();
    }
  }).then(() => esClient.indices.exists({ index: logIndex }))
    .then((exists) => {
      if (exists) {
        console.log('Elasticsearch log instance already created');
      }
      else {
        console.log('Elasticsearch Log Index doesn\'t exist, creating it');

        return esClient.indices.create({
          index: logIndex
        });
      }
    })
    .catch(e => console.error(e));
};
