'use strict';

import v from 'validimir';

const granuleSchema = {
  _type: 'map',
  _hashKey: 'name',
  _required: ['name', 'sourceFiles', 'sourceS3Uris'],
  _defaults: {
    waitForPipelineSince: Date.now,
    sentToPipeLine: false
  },
  _meta: {
    throughput: {
      read: 15,
      write: 10
    },
    timestamps: true,
    useDocumentTypes: true
  },

  // the unique granule name
  name: v().string(),
  waitForPipelineSince: v().date(),

  // list of source files on DAAC servers
  sourceFiles: v().array().each(v().string()),

  // list of source files on DAAC servers
  sourceS3Uris: v().array().each(v().string()),

  // list of source files on DAAC servers
  destinationS3Uris: v().array().each(v().string()),
  sentToPipeLine: v().boolean(),
  lastModified: v().date()
};

export default granuleSchema;
