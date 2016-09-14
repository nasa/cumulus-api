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

  var dockerImage = '985962406024.dkr.ecr.us-east-1.amazonaws.com/cumulus-archiver:latest';

  if (type === 'download') {
    step.name = 'Fetch';
    step.id = step.name;
    step.command = `
      mkdir -p /tmp/data/input/#{@pipelineId} &&
      mkdir -p /tmp/data/output/#{@pipelineId} &&
      mkdir -p /tmp/data/list &&
      aws s3 cp s3://cumulus-ghrc-logs/#{myS3FilesList} /tmp/data/list/#{myS3FilesList} &&
      aws ecr get-login --region us-east-1 | source /dev/stdin &&
      docker pull ${dockerImage} &&
      docker run
        --rm
        -v /tmp/data/input:/tmp/data/input
        -v /tmp/data/list:/tmp/data/list
        ${dockerImage} download --payload /tmp/data/list/#{myS3FilesList} --pipelineId #{@pipelineId}`;
  } else if (type === 'upload') {
    step.name = 'Push';
    step.id = step.name;
    step.command = `
      aws ecr get-login --region us-east-1 | source /dev/stdin &&
      docker pull ${dockerImage} &&
      docker run
        --rm
        -v /tmp/data/output:/tmp/data/output
        -v /tmp/data/list:/tmp/data/list
        ${dockerImage} upload --payload /tmp/data/list/#{myS3FilesList} --pipelineId #{@pipelineId}`;
  }

  step.command = step.command.replace(/\n/g, ' ').replace(/\s\s/g, '');
  setDependency(step, dependsOn);

  return step;
};

var cleanUpStep = function (group, dependsOn) {
  var step = {
    name: 'CleanUp',
    id: 'CleanUp',
    workerGroup: group,
    type: 'ShellCommandActivity',
    command: `
      rm -rf /tmp/data/list/#{myS3FilesList} &&
      rm -rf /tmp/data/input/#{@pipelineId} &&
      rm -rf /tmp/data/output/#{@pipelineId}`
  };

  step.command = step.command.replace(/\n/g, ' ').replace(/\s\s/g, '');
  setDependency(step, dependsOn);

  return step;
};

var getDockerStep = function (name, group, dockerImage, dependsOn) {
  var step = {
    name: name,
    id: name,
    workerGroup: group,
    type: 'ShellCommandActivity',
    command: `
      aws ecr get-login --region us-east-1 | source /dev/stdin &&
      docker pull ${dockerImage} &&
      docker run
        --rm
        -e "SPLUNK_HOST=#{mySplunkHost}"
        -e "SPLUNK_USERNAME=#{mySplunkUsername}"
        -e "SPLUNK_PASSWORD=#{mySplunkPassword}"
        -e "SHORT_NAME=#{myShortName}"
        -v /tmp/data:/tmp/data
        ${dockerImage} /tmp/data/input/#{@pipelineId} /tmp/data/output/#{@pipelineId}`
  };

  step.command = step.command.replace(/\n/g, ' ').replace(/\s\s/g, '');
  setDependency(step, dependsOn);

  return step;
};

var metadataStep = function (group, dependsOn) {
  var dockerImage = '985962406024.dkr.ecr.us-east-1.amazonaws.com/docker-metadata-push:latest';

  var step = {
    name: 'Metadata',
    id: 'Metadata',
    workerGroup: group,
    type: 'ShellCommandActivity',
    command: `
      aws ecr get-login --region us-east-1 | source /dev/stdin &&
      docker pull ${dockerImage} &&
      docker run
        --rm
        -e "CMR_PROVIDER=CUMULUS"
        -e "CMR_USERNAME=devseed"
        -e "CMR_PASSWORD=#{myCmrPassword}"
        -e "CMR_CLIENT_ID=Cumulus"
        -v /tmp/data/output:/tmp/data/output
        ${dockerImage} /tmp/data/output/#{@pipelineId}`
  };

  step.command = step.command.replace(/\n/g, ' ').replace(/\s\s/g, '');
  setDependency(step, dependsOn);

  return step;
};

var parameters = {
  parameters: [{
    default: 's3://cumulus-ghrc-logs/files.json',
    id: 'myS3FilesList',
    type: 'String',
    description: 'S3 path to the file containing the list of data files'
  }, {
    id: 'myS3LogsPath',
    type: 'AWS::S3::ObjectKey',
    description: 'S3 folder for logs',
    default: 's3://cumulus-ghrc-logs/logs'
  }, {
    default: 'HOST',
    id: 'mySplunkHost',
    type: 'String',
    description: 'Splunk Host address'
  }, {
    default: 'USERNAME',
    id: 'mySplunkUsername',
    type: 'String',
    description: 'Splunk Username'
  }, {
    default: 'PASSWORD',
    id: 'mySplunkPassword',
    type: 'String',
    description: 'Splunk PASSWORD'
  }, {
    default: 'Collection Short Name',
    id: 'myShortName',
    type: 'String',
    description: 'The collection shortname'
  }, {
    default: 'CMRPASSWORD',
    id: 'myCmrPassword',
    type: 'String',
    description: 'Password for accesst to CMR'
  }]
};

module.exports.ec2Resource = ec2Resource;
module.exports.pipelineObj = pipelineObj;
module.exports.getDockerArchiver = getDockerArchiver;
module.exports.getDockerStep = getDockerStep;
module.exports.parameters = parameters;
module.exports.cleanUpStep = cleanUpStep;
module.exports.metadataStep = metadataStep;
