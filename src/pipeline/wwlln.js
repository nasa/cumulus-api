'use strict';

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
    image: '985962406024.dkr.ecr.us-east-1.amazonaws.com/cumulus-hs3-wwlln:latest',
    after: 'Fetch'
  }, {
    type: 'metadata',
    name: 'Metadata',
    after: 'Process'
  }, {
    type: 'archive',
    name: 'Upload',
    action: 'upload',
    after: 'Metadata'
  }, {
    type: 'cleanup',
    after: 'Upload'
  }]
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
    recipe: recipe,
    batchLimit: 50
  }
};

module.exports = datasetRecord;
