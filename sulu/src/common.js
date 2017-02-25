'use strict';

const _ = require('lodash');
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs-extra');
const execSync = require('child_process').execSync;

/**
 * Executes shell commands synchronously and logs the
 * stdout to console.
 * @param  {String} cmd  Bash command
 * @return {String}     The command's stdout
 */
function exec(cmd) {
  const stdout = execSync(cmd);
  console.log(stdout.toString());
  return stdout;
}

/**
 * Generates configuration arrays for ApiGateway portion of
 * the CloudFormation
 * @param  {Object} config The configuration object
 * @return {Object}        Returns ApiGateway updated configruation
 */
const configureApiGateway = (config) => {
  // APIGateway name used in AWS APIGateway Definition
  const apiMethods = [];
  const apiMethodsOptions = {};

  // The array containing all the info
  // needed to define each APIGateway resource
  const apiResources = {};

  // We loop through all the lambdas in config.yml
  // To construct the API resources and methods
  for (const lambda of config.lambdas) {
    // We only care about lambdas that have apigateway config
    if (lambda.hasOwnProperty('apiGateway')) {
      // Because each segment of the URL path gets its own
      // resource and paths with the same segment shares that resource
      // we start by dividing the path segments into an array.
      // For example. /foo, /foo/bar and /foo/column create 3 resources:
      // 1. FooResource 2.FooBarResource 3.FooColumnResource
      // where FooBar and FooColumn are dependents of Foo
      const segments = lambda.apiGateway.path.split('/');

      // this array is used to keep track of names
      // within a given array of segments
      const segmentNames = [];

      segments.forEach((segment, index) => {
        let name = segment;
        let parents = [];

        // when a segment includes a variable, e.g. {short_name}
        // we remove the curly braces and underscores and add Var to the name
        if (_.startsWith(segment, '{')) {
          name = `${_.replace(_.trim(segment, '{}'), '_', '')}Var`;
        }

        name = _.upperFirst(name);
        segmentNames.push(name);

        // the first segment is always have rootresourceid as parent
        if (index === 0) {
          parents = [
            'Fn::GetAtt:',
            '- ApiGatewayRestApi',
            '- RootResourceId'
          ];
        }
        else {
          // This logic finds the parents of other segments
          parents = [
            `Ref: ApiGateWayResource${_.join(
              _.slice(segmentNames, 0, index
            ), '')}`
          ];

          name = _.join(segmentNames.map((x) => x), '');
        }

        // We use an object here to catch duplicate resources
        // This ensures if to paths shares a segment, they also
        // share a parent
        apiResources[name] = {
          name: `ApiGateWayResource${name}`,
          pathPart: segment,
          parents: parents
        };
      });

      const method = _.capitalize(lambda.apiGateway.method);
      const name = _.join(segmentNames.map((x) => x), '');

      // Build the ApiMethod array
      apiMethods.push({
        name: `ApiGatewayMethod${name}${_.capitalize(method)}`,
        method: _.upperCase(method),
        cors: lambda.apiGateway.cors || false,
        resource: `ApiGateWayResource${name}`,
        lambda: lambda.name
      });

      // Build the ApiMethod Options array. Only needed for resources
      // with cors set to true
      if (lambda.apiGateway.cors) {
        apiMethodsOptions[name] = {
          name: `ApiGatewayMethod${name}Options`,
          resource: `ApiGateWayResource${name}`
        };
      }
    }
  }

  return {
    apiMethods,
    apiResources: _.values(apiResources),
    apiMethodsOptions: _.values(apiMethodsOptions)
  };
};

/**
 * Generates an array of configuration settings for
 * Lambda function in CloudFormation Template
 * @param  {Object} config The configuration object
 * @return {Object}        Returns lambdas updated configruation
 */
const configureLambda = (config) => {
  // Add default memory and timeout to all lambdas
  for (const lambda of config.lambdas) {
    if (!_.has(lambda, 'memory')) {
      lambda.memory = 1024;
    }

    if (!_.has(lambda, 'timeout')) {
      lambda.timeout = 300;
    }

    // add stackName and stage
    lambda.stackName = config.stackName;
    lambda.stage = config.stage;

    // Get Lambda's zip file name
    lambda.zipFile = _.split(lambda.handler, '.')[0];

    if (!_.has(lambda, 'envs')) {
      lambda.envs = [];
    }
  }

  return config;
};

/**
 * Generates an array of configuration settings for
 * DynamoDB Tables in CloudFormation Template
 * @param  {Object} config The configuration object
 * @return {Object}        Returns dyanmos updated configruation
 */
const configureDynamo = (config) => {
  // Add default memory and timeout to all lambdas
  for (const tb of config.dynamos) {
    // add stackName and stage
    tb.stackName = config.stackName;
    tb.stage = config.stage;

    // if the hash is not the first item in the schema
    // throw error
    if (_.has(tb, 'schema')) {
      if (tb.schema[0].type !== 'HASH') {
        throw Error('The first KeySchemaElement is not a HASH key type');
      }
    }
  }

  return config;
};


/**
 * Generates an array of configuration settings for
 * SQS in CloudFormation Template
 * @param  {Object} config The configuration object
 * @return {Object}        Returns SQS' updated configruation
 */
const configureSqs = (config) => {
  // Add default memory and timeout to all lambdas
  for (const q of config.sqs) {
    // add stackName and stage
    q.stackName = config.stackName;
    q.stage = config.stage;
  }

  return config;
};


/**
 * Extract and parse environment variables
 * @param  {Object} config The configuration object
 * @return {Object}        Returns dyanmos updated configruation
 */
function parseEnvVariables(config) {
  let envs = {
    StackName: config.stackName,
    Stage: config.stage
  };

  // add splunk config if availble on the local machine
  if (process.env.SPLUNK_PASSWORD) {
    envs.SPLUNK_PASSWORD = process.env.SPLUNK_PASSWORD;
  }

  if (process.env.SPLUNK_USERNAME) {
    envs.SPLUNK_USERNAME = process.env.SPLUNK_USERNAME;
  }

  if (process.env.SPLUNK_HOST) {
    envs.SPLUNK_HOST = process.env.SPLUNK_HOST;
  }

  // add buckets
  envs = Object.assign({}, envs, config.buckets);

  // Match tablenames to env variables name
  for (const dynamo of config.dynamos) {
    envs[dynamo.envName] = `${config.stackName}-${config.stage}-${dynamo.name}`;
  }

  // add sqs queues and their full names
  for (const queue of config.sqs) {
    envs[queue.name] = `${config.stackName}-${config.stage}-${queue.name}`;
  }

  // add lambda names
  for (const lambda of config.lambdas) {
    if (lambda.broadcast) {
      envs[lambda.name] = `arn:aws:lambda:\$\{AWS::Region\}:\$\{AWS::AccountId\}:function:${config.stackName}-${lambda.name}-${config.stage}`; // eslint-disable-line max-len
    }
  }

  // convert the objects to list for the yml template
  const envList = [];
  Object.keys(envs).forEach((env) => {
    envList.push({ key: env, value: envs[env] });
  });

  // add envs to every lambda
  for (const lambda of config.lambdas) {
    lambda.envs = lambda.envs.concat(envList);
  }

  config.envsList = envList;

  return Object.assign(config, { envs: envs });
}

/**
 * Parses the config/config.yml to js Object
 * @return {Object}
 */
function parseConfig(configPath) {
  const p = path.join(process.cwd(), configPath || 'config/config.yml');
  let config = yaml.safeLoad(fs.readFileSync(p, 'utf8'));

  config.apiName = _.upperFirst(_.camelCase(`${config.stackName}-${config.stage}`));

  config = configureDynamo(config);
  config = configureLambda(config);
  config = configureSqs(config);
  config = parseEnvVariables(config);

  if (config.buildApiGateway) {
    config = Object.assign(config, configureApiGateway(config));
  }

  return config;
}

module.exports.parseConfig = parseConfig;
module.exports.exec = exec;
