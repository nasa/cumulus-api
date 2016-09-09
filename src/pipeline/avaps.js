
var builder = require('./builder');

var group = 'wwllnWorkerGroup';

var template = {
  objects: [
    builder.pipelineObj(),
    builder.getDockerArchiver('download', group),
    builder.getDockerStep('Process', group, '985962406024.dkr.ecr.us-east-1.amazonaws.com/cumulus-hs3-avaps:latest', 'GetFileList'),
    // builder.getDockerStep('Metadata', group, 'developmentseed/cumulus-test:wwlln-metadata', 'Process'),
    builder.getDockerArchiver('upload', group, 'Process')
  ]
};

var datasetRecord = {
  name: 'avaps',
  shortName: 'avaps',
  daacName: 'Global Hydrology Resource Center DAAC',
  sourceDataBucket: {
    bucketName: 'cumulus-ghrc-raw',
    prefix: 'avaps/',
    granulesFiles: 1,
    format: '.eol'
  },
  destinationDataBucket: {
    bucketName: 'cumulus-ghrc-archive',
    prefix: 'avaps/',
    granulesFiles: 1,
    format: '.nc'
  },
  dataPipeLine: {
    template: template,
    parameters: builder.parameters,
    batchLimit: 500
  }
};

module.exports = datasetRecord;
