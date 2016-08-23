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
      bucketName: 'cumulus-source',
      prefix: 'wwlln/source/',
      granulesFiles: 1
    },
    destinationDataBucket: {
      bucketName: 'cumulus-source',
      prefix: 'wwlln/processed/',
      granulesFiles: 3
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
          name: 'CopySourceData',
          id: 'CopySourceData',
          runsOn: {
            ref: 'CumulusEC2Instance'
          },
          type: 'ShellCommandActivity',
          command: 'mkdir -p /tmp/source && mkdir -p /tmp/dst && aws s3 cp #{myS3FilesList} files.json && cat files.json | jq -r \'.files | map(.) | join("\n")\' | while read line ; do aws s3 cp $line /tmp/source/; done'
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
          command: 'docker pull developmentseed/cumulus-test:wwlln-processing > /dev/null && docker run -v /tmp/source:/ftp/private/hs3/internal/WWLLN/HS3storms -v /tmp/dst:/astage/ops/hs3wwlln --rm developmentseed/cumulus-test:wwlln-processing > /dev/null; curl -k #{mySplunkHECURL}?host=${HOSTNAME} --header \'Authorization: Splunk #{mySplunkHECToken}\' --header \'X-Splunk-Request-Channel: $(uuidgen)\' --data-binary \'$(docker logs -t $(docker ps -q -n=1))\''
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
          command: 'docker pull developmentseed/cumulus-test:wwlln-metadata > /dev/null && docker run -v /tmp/dst:/s3/wwlln --rm developmentseed/cumulus-test:wwlln-metadata > /dev/null; curl -k #{mySplunkHECURL}?host=${HOSTNAME} --header \'Authorization: Splunk #{mySplunkHECToken}\' --header \'X-Splunk-Request-Channel: $(uuidgen)\' --data-binary \'$(docker logs -t $(docker ps -q -n=1))\''
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
          command: 'aws s3 sync /tmp/dst #{myUploadBucketPath}'
        }, {
          resourceRole: 'DataPipelineDefaultResourceRole',
          role: 'DataPipelineDefaultRole',
          imageId: 'ami-64a6c773',
          instanceType: 't2.micro',
          name: 'CumulusDataPipeLine',
          keyPair: 'cumulus-scisco',
          securityGroupIds: ['sg-3e11b044'],
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
          watermark: 's3://cumulus-source/files.json',
          id: 'myS3FilesList',
          type: 'String',
          description: 'S3 path to the file containing the list of data files'
        }, {
          id: 'myUploadBucketPath',
          type: 'String',
          description: 'S3 path to upload processed files',
          default: 's3://cumulus-source/wwlln/processed'
        }, {
          id: 'myS3LogsPath',
          type: 'AWS::S3::ObjectKey',
          description: 'S3 folder for logs',
          default: 's3://cumulus-source/logs'
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
