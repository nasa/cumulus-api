
var builder = require('./builder');

var group = 'wwllnWorkerGroup';

var template = {
  objects: [
    builder.pipelineObj(),
    builder.getDockerArchiver('download', group),
    builder.getDockerStep('WwllnProcess', group, 'developmentseed/cumulus-test:wwlln-processing', 'GetFileList'),
    builder.getDockerStep('WwllnMetadata', group, 'developmentseed/cumulus-test:wwlln-metadata', 'WwllnProcess'),
    builder.getDockerArchiver('upload', group, 'WwllnProcess')
  ]
};

var datasetRecord = {
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
    template: template,
    parameters: builder.parameters,
    batchLimit: 50
  }
};

module.exports = datasetRecord;
