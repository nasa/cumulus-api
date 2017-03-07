'use strict';

const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const parseConfig = require('./common').parseConfig;
const exec = require('./common').exec;

function getLambdaZipFile(handler) {
  return _.split(handler, '.')[0];
}

/**
 * Groups the lambdas by their folder name in a js object
 * This is needed because the code for a lambda function could
 * be shared across multiple lambdas. For example, collections.zip
 * is used for getCollection, listCollections and PostCollection
 * lambdas. This function creats list of all lambdas for each
 * lambda zip file. The information is exracted from the config.yml
 * @return {Object} A grouped lambdas list
 */
function lambdaObject() {
  const c = parseConfig();
  const obj = {};

  // add distribution
  c.lambdas.push({
    handler: 'distribution.handler',
    name: 'distribution'
  });

  // add dynamo to es function
  c.lambdas.push({
    handler: 'es.handler',
    name: 'dynamoToEs'
  });

  for (const lambda of c.lambdas) {
    // extract the lambda folder name from the handler
    const funcName = getLambdaZipFile(lambda.handler);

    // create the list
    if (_.has(obj, funcName)) {
      obj[funcName].push({
        handler: lambda.handler,
        function: funcName,
        name: `${c.stackName}-${lambda.name}-${c.stage}`
      });
    }
    else {
      obj[funcName] = [{
        handler: lambda.handler,
        function: funcName,
        name: `${c.stackName}-${lambda.name}-${c.stage}`
      }];
    }
  }

  return obj;
}

/**
 * Zips lambda functions and uploads them to a given S3 location
 * @param  {string} s3Path  A valid S3 URI for uploading the zip files
 * @param  {string} profile The profile name used in aws CLI
 */
function uploadLambdas(s3Path, profile) {
  // remove the build folder if exists
  fs.removeSync(path.join(process.cwd(), 'build'));

  // create the lambda folder
  fs.mkdirpSync(path.join(process.cwd(), 'build/lambda'));

  // zip files dist folders
  const distFolders = fs.readdirSync('dist');
  distFolders.forEach((dir) => {
    exec(`cd dist && zip -r ../build/lambda/$(basename ${dir} .js) ${dir}`);
  });

  // upload the artifacts to AWS S3
  // we use the aws cli to make things easier
  // this fails if the user doesn't have aws-cli installed
  exec(`cd build && aws s3 cp --recursive . ${s3Path}/ \
                              --profile ${profile} \
                              --exclude=.DS_Store`);
}

/**
 * Uploads the zip code of a given lambda function to AWS Lambda
 * @param  {Object} options options passed by the commander module
 * @param  {String} name    name of the lambda function
 */
function updateLambda(options, name, webpack) {
  const profile = options.profile;
  const lambdas = lambdaObject();

  // Run webpack
  if (_.has(webpack, 'webpack') && webpack.webpack) {
    exec('webpack');
  }

  // create the lambda folder if it doesn't already exist
  fs.mkdirpSync(path.join(process.cwd(), 'build/lambda'));

  // Update the zip file
  exec(`cd dist && zip -r ../build/lambda/${name} ${name}`);

  for (const lambda of lambdas[name]) {
    // Upload the zip file to AWS Lambda
    exec(`aws lambda update-function-code \
      --function-name ${lambda.name} \
      --zip-file fileb://build/lambda/${name}.zip \
      --profile ${profile}`);
  }
}

module.exports.uploadLambdas = uploadLambdas;
module.exports.updateLambda = updateLambda;
module.exports.getLambdaZipFile = getLambdaZipFile;
