#! /usr/bin/env node --harmony

'use strict';

const program = require('commander');
const lib = require('../index');

const cf = lib.cf;
const dynamo = lib.dynamo;
const lambda = lib.lambda;
const serve = lib.offline;
const bootstrap = lib.bootstrap;
const users = lib.users;
const envs = lib.envs;

// the CLI activation
program
  .usage('TYPE COMMAND [options]')
  .option('-p, --profile <profile>', 'AWS profile name to use for authentication', 'default')
  .option('-c, --config <config>', 'Path to config file', 'config/config.yml')
  .option('-r, --region', 'AWS region', 'us-east-1')
  .option('--stack <stack>', 'stack name, defaults to the config value')
  .option('--stage <stage>', 'stage name, defaults to the config value');

program
  .command('cf [create|update|validate|compile|dlq]')
  .description(`CloudFormation Operations:
    create    Creates the CF stack
    update    Updates the CF stack
    validate  Validates the CF stack
    compile   Compiles the CF stack
    dlq       add dead letter queue to lambdas`)
  .action((cmd) => {
    switch (cmd) {
      case 'create':
        cf.createStack(program);
        break;
      case 'update':
        cf.updateStack(program);
        break;
      case 'validate':
        cf.validateTemplate(program);
        break;
      case 'compile':
        cf.compileCF(program);
        break;
      case 'dlq':
        cf.dlqToLambda(program);
        break;
      default:
        console.log('Wrong choice. Accepted arguments: [create|update|validate|compile|dlq]');
    }
  });

program
  .command('db [add]')
  .description('Add given record to DynamoDB')
  .option('-t, --table <table>', 'DynamoDB table name')
  .option('-r, --record <record>', 'Path to a JSON file containing the record to be added')
  .option('-l, --local', 'Whether to add the record to a local dynamoDB running on port 8000')
  .action((cmd, options) => {
    switch (cmd) {
      case 'add':
        dynamo.addRecord(Object.assign({}, program, options));
        break;
      default:
        console.log('Wrong choice. Accepted arguments: [add]');
    }
  });

program
  .command('lambda <lambdaName>')
  .description('uploads a given lambda function to Lambda service')
  .option('-w, --webpack', 'Whether to run the webpack before updating the lambdas')
  .action((cmd, options) => {
    if (cmd) {
      lambda.updateLambda(program, cmd, options);
    }
    else {
      console.log('Lambda name is missing');
    }
  });

program
  .command('serve')
  .description('Serves the APIGateway locally')
  .action(() => serve());

program
  .command('bootstrap [local|remote]')
  .description('create tables and queues on local DynamoDB and SQS')
  .option(
    '--delete',
    'Delete Elasticsearch indices and recreate them. WARNING: This will delete all the data'
  ).action((cmd, options) => {
    bootstrap(cmd, program, options.delete);
  });

program
  .command('user [add|list|create] [username] [password]')
  .description('List users')
  .option('-l, --local', 'run this locally')
  .action((cmd, username, password, options) => {
    envs.apply(program.stage);
    switch (cmd) {
      case 'add':
        users.add(username, password, options);
        break;
      case 'list':
        users.list(program, options);
        break;
      case 'delete':
        users.delete(username, options);
        break;
      default:
        console.log('nothing');
    }
  });

program
  .parse(process.argv);
