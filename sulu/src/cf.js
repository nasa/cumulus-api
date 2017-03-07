'use strict';

const Handlebars = require('handlebars');
const path = require('path');
const fs = require('fs-extra');
const parseConfig = require('./common').parseConfig;
const uploadKeyPair = require('./crypto').uploadKeyPair;
const exec = require('./common').exec;
const uploadLambdas = require('./lambda').uploadLambdas;


/**
 * Compiles a CloudFormation template in Yaml format
 * Reads the configuration yaml from config/config.yml
 * Writes the template to config/cloudformation.yml
 * Uses config/cloudformation.tempalte.yml as the base template
 * for generating the final CF template
 * @return {null}
 */
const compileCF = (options) => {
  const config = parseConfig(options.config, options.stack, options.stage);

  const t = fs.readFileSync(path.join(process.cwd(), 'config/cloudformation.template.yml'), 'utf8');
  const template = Handlebars.compile(t);

  const destPath = path.join(process.cwd(), 'config/cloudformation.yml');
  console.log(`CF template saved to ${destPath}`);
  fs.writeFileSync(destPath, template(config));
};

/**
 * Uploads the Cloud Formation template to a given S3 location
 * @param  {string} s3Path  A valid S3 URI for uploading the zip files
 * @param  {string} profile The profile name used in aws CLI
 */
function uploadCF(s3Path, profile, configPath) {
  // build the template first
  compileCF(configPath);

  // make sure cloudformation template exists
  try {
    fs.accessSync(path.join(process.cwd(), 'config/cloudformation.yml'));
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

function dlqToLambda(options) {
  const profile = options.profile;
  const config = parseConfig(options.config, options.stack, options.stage);
  let queueUrl;
  let queueArn;

  console.log('Adding Dead Letter Queue to Lambda Functions');
  for (const lambda of config.lambdas) {
    if (lambda.dlq) {
      // get queue arn
      if (!queueUrl) {
        let temp = exec(`aws sqs get-queue-url \
          --queue-name ${config.stackName}-${config.stage}-${lambda.dlq} \
          --profile ${profile}`);
        queueUrl = JSON.parse(temp).QueueUrl;

        temp = exec(`aws sqs get-queue-attributes \
          --attribute-names QueueArn \
          --queue-url ${queueUrl} \
          --profile ${profile}`);
        queueArn = JSON.parse(temp).Attributes.QueueArn;
      }

      exec(`aws lambda update-function-configuration \
        --function-name ${config.stackName}-${lambda.name}-${config.stage} \
        --dead-letter-config TargetArn=${queueArn}`);
    }
  }
}


/**
 * Returns the configuration file and checks if the bucket specified
 * in the configuration file exists on S3. If the bucket does not exist,
 * it throws an error.
 * @param  {String} profile The profile name to use with AWS CLI
 * @return {Object}         The configuration Object
 */
function getConfig(options, configPath) {
  // get the configs
  const config = parseConfig(configPath, options.stack, options.stage);

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
    exec(`aws s3 ls s3://${config.buckets.internal} --profile ${options.profile}`);
  }
  catch (e) {
    console.error(`${config.buckets.internal} does not exist or ` +
      'your profile doesn\'t have access to it. Either create the ' +
      'bucket or make sure your credentials have access to it');
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
  artifactHash = artifactHash.toString().replace(/\n/, '');

  // Make the S3 Path
  const s3Path = `s3://${c.buckets.internal}/${c.stackName}-${c.stage}/${artifactHash}`;
  const url = `https://s3.amazonaws.com/${c.buckets.internal}/${c.stackName}-${c.stage}/${artifactHash}`;

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
  const configPath = options.config;

  // Get the config
  const c = getConfig(options, configPath);

  // Get the checksum hash
  const h = getHash(c);

  console.log('Validating the template');
  const url = `${h.url}/cloudformation.yml`;

  // Build and upload the CF template
  uploadCF(h.path, profile, configPath);

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
  const configPath = options.config;

  // Get the config
  const c = getConfig(options, configPath);

  // Get the checksum hash
  const h = getHash(c);

  // upload lambdas and the cf template
  uploadLambdas(h.path, profile);

  // Build and upload the CF template
  uploadCF(h.path, profile, configPath);

  cloudFormation(
    ops,
    `${h.url}/cloudformation.yml`,
    c.stackName,
    c.buckets.internal,
    h.hash,
    profile
  );
}

/**
 * Creates a CloudFormation stack
 * @param  {Object} options The options object should include the profile name (optional)
 */
function createStack(options) {
  // generating private/public keys first
  const c = getConfig(options, options.config);
  uploadKeyPair(c.buckets.internal, c.stackName, c.stage, options.profile, (e) => {
    if (e) {
      console.log(e);
      process.exit(1);
    }

    opsStack(options, 'create');
  });
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
module.exports.dlqToLambda = dlqToLambda;
