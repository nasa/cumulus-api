
var builder = require('./builder');

var group = 'wwllnWorkerGroup';

var template = {
  objects: [
    builder.pipelineObj(),
    builder.getDockerArchiver('download', group),
    builder.getDockerStep('WwllnProcess', group, '985962406024.dkr.ecr.us-east-1.amazonaws.com/cumulus-hs3-wwlln:latest', 'Fetch'),
    builder.metadataStep(group, 'WwllnProcess'),
    builder.getDockerArchiver('upload', group, 'Metadata'),
    builder.cleanUpStep(group, 'Push')
  ]
};

var datasetRecord = {
  name: 'wwlln',
  shortName: 'hs3wwlln',
  versionId: 1,
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
