'use strict';

var Builder = require('./builder');

var recipe = {
  resource: 'group',
  name: 'WorkerGroup',
  steps: [{
    type: 'archive',
    name: 'Fetch',
    action: 'download'
  }, {
    type: 'runner',
    name: 'Process',
    image: '985962406024.dkr.ecr.us-east-1.amazonaws.com/cumulus-hs3-cpl:latest',
    after: 'Fetch'
  }, {
    type: 'metadata',
    name: 'Metadata',
    after: 'Process'
  }, {
    type: 'archive',
    name: 'Fetch',
    action: 'download',
    after: 'Metadata'
  }, {
    type: 'cleanup'
  }]
};

var builder = new Builder(recipe);

var datasetRecord = {
  name: 'cpl',
  shortName: 'hs3cpl',
  versionId: 1,
  daacName: 'Global Hydrology Resource Center DAAC',
  sourceDataBucket: {
    bucketName: 'cumulus-ghrc-raw',
    prefix: 'cpl/',
    granulesFiles: 1,
    format: '.hdf5'
  },
  destinationDataBucket: {
    bucketName: 'cumulus-ghrc-archive',
    prefix: 'hs3cpl/',
    granulesFiles: 1,
    format: '.nc'
  },
  dataPipeLine: {
    template: builder.template,
    parameters: builder.parameters,
    batchLimit: 10
  }
};

module.exports = datasetRecord;
