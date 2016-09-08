'use strict';

var pipelineObj = function () {
  return {
    failureAndRerunMode: 'CASCADE',
    resourceRole: 'DataPipelineDefaultResourceRole',
    role: 'DataPipelineDefaultRole',
    scheduleType: 'ONDEMAND',
    name: 'Default',
    id: 'Default',
    pipelineLogUri: '#{myS3LogsPath}'
  };
};

var ec2Resource = function () {
  return {
    resourceRole: 'DataPipelineDefaultResourceRole',
    role: 'DataPipelineDefaultRole',
    imageId: 'ami-e8ed7eff',
    instanceType: 't2.micro',
    name: 'CumulusDataPipeLine',
    keyPair: 'cumulus-scisco',
    securityGroupIds: ['sg-f179698a'],
    id: 'CumulusEC2Instance',
    type: 'Ec2Resource',
    actionOnTaskFailure: 'terminate',
    actionOnResourceFailure: 'retryAll',
    maximumRetries: '1',
    associatePublicIpAddress: 'true',
    terminateAfter: '1 hours'
  };
};

var setDependency = function (step, dependency) {
  if (dependency) {
    step.dependsOn = {
      ref: dependency
    };
  }
  return step;
};

var getDockerArchiver = function (type, group, dependsOn) {
  var step = {
    workerGroup: group,
    type: 'ShellCommandActivity'
  };

  if (type === 'download') {
    step.name = 'GetFileList';
    step.id = step.name;
    step.command = 'mkdir -p /tmp/data/input && mkdir -p /tmp/data/output && mkdir -p /tmp/data/list && aws s3 cp #{myS3FilesList} /tmp/data/list/files.json && docker run --rm -v /tmp/data/input:/tmp/in -v /tmp/data/list:/tmp/list -e "AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}" -e "AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}" -e "AWS_DEFAULT_REGION=us-east-1" developmentseed/cumulus-test:granule_handler download -f /tmp/list/files.json -p somekey';
  } else if (type === 'upload') {
    step.name = 'CopyProcessedData';
    step.id = step.name;
    step.command = 'docker run --rm -v /tmp/data/output:/tmp/out -v /tmp/data/list:/tmp/list -e "AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}" -e "AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}" -e "AWS_DEFAULT_REGION=us-east-1" developmentseed/cumulus-test:granule_handler upload -f /tmp/list/files.json -p somekey';
  }

  setDependency(step, dependsOn);

  return step;
};

var getDockerStep = function (name, group, dockerImage, dependsOn) {
  var step = {
    name: name,
    id: name,
    workerGroup: group,
    type: 'ShellCommandActivity',
    command: `docker pull ${dockerImage} && docker run --rm -v /tmp/data:/work/data -t ${dockerImage} data/input data/output`
  };

  setDependency(step, dependsOn);

  return step;
};

var parameters = {
  parameters: [{
    watermark: 's3://cumulus-ghrc-logs/files.json',
    id: 'myS3FilesList',
    type: 'String',
    description: 'S3 path to the file containing the list of data files'
  }, {
    id: 'myUploadBucketPath',
    type: 'String',
    description: 'S3 path to upload processed files',
    default: 's3://cumulus-ghrc-archive/wwlln/'
  }, {
    id: 'myS3LogsPath',
    type: 'AWS::S3::ObjectKey',
    description: 'S3 folder for logs',
    default: 's3://cumulus-ghrc-logs/logs'
  }, {
    id: 'mySplunkHECToken',
    type: 'String',
    description: 'Splunk HTTP Event Collector token; in production, this will be a Secret',
    default: process.env.mySplunkHECToken
  }, {
    id: 'mySplunkHECURL',
    type: 'String',
    description: 'Splunk HTTP Event Collector URL',
    default: 'https://107.21.62.189:8087/services/collector/raw'
  }, {
    id: 'myEarthDataPass',
    type: 'String',
    description: 'EarthData Pass',
    default: process.env.myEarthDataPass
  }]
};

module.exports.ec2Resource = ec2Resource;
module.exports.pipelineObj = pipelineObj;
module.exports.getDockerArchiver = getDockerArchiver;
module.exports.getDockerStep = getDockerStep;
module.exports.parameters = parameters;
