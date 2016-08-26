'use strict';

var dynamoose = require('dynamoose');
var tables = require('./tables');
var models = require('./models');

var populateDataSets = function () {
  var sampleRecord = {
    name: 'WWLLN',
    shortName: 'wwlln',
    daacName: 'Global Hydrology Resource Center DAAC',
    sourceDataBucket: {
      bucketName: 'cumulus-ghrc-raw',
      prefix: 'wwlln/',
      granulesFiles: 1,
      format: '.loc'
    },
    destinationDataBucket: {
      bucketName: 'cumulus-ghrc-archive',
      prefix: 'wwlln/',
      granulesFiles: 1,
      format: '.loc.nc'
    },
    dataPipeLine: {
      template: {
        objects: [{
          failureAndRerunMode: 'CASCADE',
          resourceRole: 'DataPipelineDefaultResourceRole',
          role: 'DataPipelineDefaultRole',
          scheduleType: 'ONDEMAND',
          name: 'Default',
          id: 'Default',
          pipelineLogUri: '#{myS3LogsPath}'
        }, {
          name: 'GetFileList',
          id: 'GetFileList',
          runsOn: {
            ref: 'CumulusEC2Instance'
          },
          type: 'ShellCommandActivity',
          command: 'mkdir -p /tmp/source && mkdir -p /tmp/dst && mkdir -p /tmp/list && aws s3 cp #{myS3FilesList} /tmp/list/files.json'
        }, {
          name: 'CopySourceData',
          id: 'CopySourceData',
          runsOn: {
            ref: 'CumulusEC2Instance'
          },
          dependsOn: {
            ref: 'GetFileList'
          },
          type: 'ShellCommandActivity',
          command: 'docker run --rm -v /tmp/source:/tmp/in -v /tmp/list:/tmp/list -e "AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}" -e "AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}" -e "AWS_DEFAULT_REGION=us-east-1" developmentseed/cumulus-test:granule_handler download -f /tmp/list/files.json -p somekey'
        }, {
          name: 'WwllnProcess',
          id: 'WwllnProcess',
          runsOn: {
            ref: 'CumulusEC2Instance'
          },
          dependsOn: {
            ref: 'CopySourceData'
          },
          type: 'ShellCommandActivity',
          command: 'docker pull developmentseed/cumulus-test:wwlln-processing && docker run -v /tmp/source:/ftp/private/hs3/internal/WWLLN/HS3storms -v /tmp/dst:/astage/ops/hs3wwlln --rm developmentseed/cumulus-test:wwlln-processing'
        }, {
          name: 'WwllnMetadata',
          id: 'WwllnMetadata',
          runsOn: {
            ref: 'CumulusEC2Instance'
          },
          dependsOn: {
            ref: 'WwllnProcess'
          },
          type: 'ShellCommandActivity',
          command: 'docker pull developmentseed/cumulus-test:wwlln-metadata && docker run -v /tmp/dst:/s3/wwlln --rm developmentseed/cumulus-test:wwlln-metadata'
        }, {
          name: 'CopyProcessedData',
          id: 'CopyProcessedData',
          runsOn: {
            ref: 'CumulusEC2Instance'
          },
          dependsOn: {
            ref: 'WwllnMetadata'
          },
          type: 'ShellCommandActivity',
          command: 'docker run --rm -v /tmp/dst:/tmp/out -v /tmp/list:/tmp/list -e "AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}" -e "AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}" -e "AWS_DEFAULT_REGION=us-east-1" developmentseed/cumulus-test:granule_handler upload -f /tmp/list/files.json -p somekey'
        }, {
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
        }]
      },
      parameters: {
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
          default: 'F8E196DC-A2A5-4B86-9571-6AB3995A8AE3'
        }, {
          id: 'mySplunkHECURL',
          type: 'String',
          description: 'Splunk HTTP Event Collector URL',
          default: 'https://107.21.62.189:8087/services/collector/raw'
        }]
      },
      batchLimit: 20
    }
  };

  var Dataset = dynamoose.model(
    tables.datasetTableName,
    models.dataSetSchema,
    {create: true}
  );

  var newRecord = new Dataset(sampleRecord);
  newRecord.save();
};

populateDataSets();
