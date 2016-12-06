'use strict';

const _ = require('lodash');
const Handlebars = require('handlebars');
const fs = require('fs-extra');
const parseConfig = require('./common').parseConfig;
const exec = require('./common').exec;
const uploadLambdas = require('./lambda').uploadLambdas;

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
 * @return {Object}        Returns ApiGateway updated configruation
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
const compileCF = () => {
  let config = parseConfig();
  config.apiName = _.upperFirst(_.camelCase(`${config.stackName}-${config.stage}`));

  config = configureLambda(config);

  if (config.buildApiGateway) {
    config = Object.assign(config, configureApiGateway(config));
  }

  // add config bucket if not included
  if (!_.has(config, 'configBucket')) {
    config.configBucket = `${config.stackName}-deploy`;
  }

  const t = fs.readFileSync('config/cloudformation.template.yml', 'utf8');
  const template = Handlebars.compile(t);

  const destPath = 'config/cloudformation.yml';
  console.log(`CF template saved to ${destPath}`);
  fs.writeFileSync(destPath, template(config));
};

/**
 * Uploads the Cloud Formation template to a given S3 location
 * @param  {string} s3Path  A valid S3 URI for uploading the zip files
 * @param  {string} profile The profile name used in aws CLI
 */
function uploadCF(s3Path, profile) {
  // build the template first
  compileCF();

  // make sure cloudformation template exists
  try {
    fs.accessSync('config/cloudformation.yml');
  }
  catch (e) {
    console.log('cloudformation.yml is missing.');
    process.exit(1);
  }

  // upload CF template to S3
  exec(`aws s3 cp config/cloudformation.yml ${s3Path}/ \
                  --profile ${profile}`);
}

function cloudFormation(op, templateUrl, stackName, configBucket, artifactHash, profile) {
  // Run the cloudformation cli command
  exec(`aws cloudformation ${op}-stack \
--profile ${profile} \
--stack-name ${stackName} \
--template-url "${templateUrl}" \
--parameters "ParameterKey=ConfigS3Bucket,ParameterValue=${configBucket},UsePreviousValue=false" \
"ParameterKey=ArtifactPath,ParameterValue=${artifactHash},UsePreviousValue=false" \
--capabilities CAPABILITY_IAM`
  );

  // await for the response
  console.log(`Waiting for the stack to be ${op}ed:`);
  try {
    exec(`aws cloudformation wait stack-${op}-complete \
            --stack-name ${stackName} \
            --profile ${profile}`);
    console.log(`Stack is successfully ${op}ed`);
  }
  catch (e) {
    console.log('Stack creation failed due to:');
    console.log(e);
    process.exit(1);
  }
}

/**
 * Returns the configuration file and checks if the bucket specified
 * in the configuration file exists on S3. If the bucket does not exist,
 * it throws an error.
 * @param  {String} profile The profile name to use with AWS CLI
 * @return {Object}         The configuration Object
 */
function getConfig(profile) {
  // get the configs
  const config = parseConfig();
  config.bucket = config.configBucket;

  // throw error if dist folder doesn't exist
  try {
    fs.accessSync('dist');
  }
  catch (e) {
    console.error('Dist folder is missing. Run npm install first.');
    process.exit(1);
  }

  // check if the configBucket exists, if not throw an error
  try {
    exec(`aws s3 ls s3://${config.bucket} --profile ${profile}`);
  }
  catch (e) {
    console.error(`${config.bucket} does not exist or your profile doesn't have access to it.
Either create the bucket or make sure your credentials have access to it`);
    process.exit(1);
  }

  return config;
}

/**
 * Generates a unique hash for the deployment from the files
 * in the dist forlder
 * @param  {Object} c Configuration file
 * @return {Object}   Returns the hash and the S3 bucket path for storing the data
 */
function getHash(c) {
  // get the artifact hash
  // this is used to separate deployments from different machines
  let artifactHash = exec(`find dist -type f | \
                           xargs shasum | shasum | awk '{print $1}' ${''}`);
  artifactHash = _.replace(artifactHash, '\n', '');

  // Make the S3 Path
  const s3Path = `s3://${c.bucket}/${c.stackName}-${c.stage}/${artifactHash}`;
  const url = `https://s3.amazonaws.com/${c.bucket}/${c.stackName}-${c.stage}/${artifactHash}`;

  return {
    hash: artifactHash,
    path: s3Path,
    url: url
  };
}

/**
 * Validates the CF template
 * @param  {Object} options The options object should include the profile name (optional)
 */
function validateTemplate(options) {
  const profile = options.profile;

  // Get the config
  const c = getConfig(options.profile);

  // Get the checksum hash
  const h = getHash(c);

  console.log('Validating the template');
  const url = `${h.url}/cloudformation.yml`;

  // Build and upload the CF template
  uploadCF(h.path, profile);

  exec(`aws cloudformation validate-template \
--template-url "${url}" \
--profile ${profile}`);
}

/**
 * Generic create/update a CloudFormation stack
 * @param  {Object} options The options object should include the profile name (optional)
 * @param {String} ops Operation name, e.g. create/update
 */
function opsStack(options, ops) {
  const profile = options.profile;

  // Get the config
  const c = getConfig(options.profile);

  // Get the checksum hash
  const h = getHash(c);

  // upload lambdas and the cf template
  uploadLambdas(h.path, profile);

  // Build and upload the CF template
  uploadCF(h.path, profile);

  cloudFormation(
    ops,
    `${h.url}/cloudformation.yml`,
    c.stackName,
    c.bucket,
    h.hash,
    profile
  );
}

/**
 * Creates a CloudFormation stack
 * @param  {Object} options The options object should include the profile name (optional)
 */
function createStack(options) {
  opsStack(options, 'create');
}

/**
 * Updates a CloudFormation stack
 * @param  {Object} options The options object should include the profile name (optional)
 */
function updateStack(options) {
  try {
    opsStack(options, 'update');
  }
  catch (e) {
    console.log('CloudFormation Update failed');
    process.exit(1);
  }
}

module.exports.validateTemplate = validateTemplate;
module.exports.compileCF = compileCF;
module.exports.createStack = createStack;
module.exports.updateStack = updateStack;
