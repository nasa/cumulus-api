'use strict';

import v from 'validimir';

// Schema for DAAC datasets
const dataSetSchema = {
  _type: 'map',
  _hashkey: 'name',
  _required: ['name', 'shortName', 'versionId', 'daacName',
    'sourceDataBucket', 'destinationDataBucket', 'dataPipeLine'],
  _meta: {
    throughput: {
      read: 15,
      write: 10
    },
    timestamps: true,
    useDocumentTypes: true
  },

  // The name of the data set, e.g. WWLLN
  name: v().string(),

  // the short_name/concept_id needed for getting collection level metadata
  shortName: v().string(),
  versionId: v().number(),

  // Name of the DAAC, e.g. Global Hydrology Resource Center DAAC
  daacName: v().string(),

  // The bucket where source data is stored
  sourceDataBucket: {
    _type: 'map',
    _required: ['bucketName', 'prefix'],
    bucketName: v().string(),
    prefix: v().string(),
    granulesFiles: v().number(),
    format: v().string()
  },

  // the bucket where destination data is stored
  destinationDataBucket: {
    _type: 'map',
    _required: ['bucketName', 'prefix'],
    bucketName: v().string(),
    prefix: v().string(),
    granulesFiles: v().number(),
    format: v().string()
  },

  dataPipeLine: {
    _type: 'map',
    _required: [],
    _defaults: { batchLimit: 100 },
    recipe: v().object(),
    batchLimit: v().number()
  }
};

export default dataSetSchema;
