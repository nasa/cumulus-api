'use strict';

import _ from 'lodash';
import fs from 'fs';
import yaml from 'js-yaml';
import Handlebars from 'handlebars';

/**
 * Generates configuration arrays for ApiGateway portion of
 * the CloudFormation
 * @param  {Object} config The configuration object
 * @return {Object}        Returns ApiGateway updated configruation
 */
const configureApiGateway = (config) => {
  // APIGateway name used in AWS APIGateway Definition
  const apiName = `${config.stackName}-${config.stage}`;
  const apiMethods = [];
  const apiMethodsOptions = {};

  // The array containing all the info
  // needed to define each APIGateway resource
  const apiResources = {};

  // We loop through all the lambdas in config.yml
  // To construct the API resources and methods
  for (const lambda of config.lambdas) {
    // We only care about lambdas that have apigateway config
    if (_.has(lambda, 'apiGateway')) {
      // Because each segment of the URL path gets its own
      // resource and paths with the same segment shares that resource
      // we start by dividing the path segments into an array.
      // For example. /foo, /foo/bar and /foo/column create 3 resources:
      // 1. FooResource 2.FooBarResource 3.FooColumnResource
      // where FooBar and FooColumn are dependents of Foo
      const segments = _.split(lambda.apiGateway.path, '/');

      // this array is used to keep track of names
      // within a given array of segments
      const segmentNames = [];

      segments.forEach((segment, index) => {
        let name = segment
        let parents = [];

        // when a segment includes a variable, e.g. {short_name}
        // we remove the curly braces and underscores and add Var to the name
        if (_.startsWith(segment, '{')) {
          name = _.replace(_.trim(segment, '{}'), '_', '') + 'Var'
        }

        name = _.upperFirst(name);
        segmentNames.push(name)

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
            'Ref: ApiGateWayResource' + _.join(
              _.slice(segmentNames, 0, index
            ), '')
          ]

          name = _.join(segmentNames.map((x) => x), '')
        }

        // We use an object here to catch duplicate resources
        // This ensures if to paths shares a segment, they also
        // share a parent
        apiResources[name] = {
          name: 'ApiGateWayResource' + name,
          pathPart: segment,
          parents: parents
        }
      });

      const method = _.capitalize(lambda.apiGateway.method)
      const name = _.join(segmentNames.map((x) => x), '');

      // Build the ApiMethod array
      apiMethods.push({
        name: 'ApiGatewayMethod' + name + _.capitalize(method),
        method: _.upperCase(method),
        cors: lambda.apiGateway.cors || false,
        resource: 'ApiGateWayResource' + name,
        lambda: lambda.name
      })

      // Build the ApiMethod Options array. Only needed for resources
      // with cors set to true
      if (lambda.apiGateway.cors) {
        apiMethodsOptions[name] = {
          name: 'ApiGatewayMethod' + name + 'Options',
          resource: 'ApiGateWayResource' + name
        }
      }
    }
  }

  return {
    apiMethods,
    apiResources: _.values(apiResources),
    apiMethodsOptions: _.values(apiMethodsOptions)
  }
};

/**
 * Generates an array of configuration settings for
 * Lambda function in CloudFormation Template
 * @param  {Object} config The configuration object
 * @return {Object}        Returns ApiGateway updated configruation
 */
const configureLambda = (config) => {
  // Add default memory and timeout to all lambdas
  for (const lambda of config.lambdas) {
    if (!_.has(lambda, 'memory')) {
      lambda.memory = 1024
    }

    if (!_.has(lambda, 'timeout')) {
      lambda.timeout = 300
    }

    // add stackName and stage
    lambda.stackName = config.stackName;
    lambda.stage = config.stage;
  }

  return config;
};

/**
 * Compiles a CloudFormation template in Yaml format
 * Reads the configuration yaml from config/config.yml
 * Writes the template to config/cloudformation.yml
 * Uses config/cloudformation.tempalte.yml as the base template
 * for generating the final CF template
 * @return {null}
 */
const compile = () => {
  let config = yaml.safeLoad(fs.readFileSync('config/config.yml', 'utf8'));

  config = configureLambda(config);

  if (config.buildApiGateway) {
    config = Object.assign(config, configureApiGateway(config))
  }

  // add config bucket if not included
  if (!_.has(config, 'configBucket')) {
    config.configBucket = config.stackName + '-deploy'
  }

  const t = fs.readFileSync('config/cloudformation.template.yml', 'utf8');
  var template = Handlebars.compile(t);

  const destPath = 'config/cloudformation.yml'
  console.log(`CF template saved to ${destPath}`)
  fs.writeFileSync(destPath, template(config));
};

if (require.main === module) {
  compile();
}
