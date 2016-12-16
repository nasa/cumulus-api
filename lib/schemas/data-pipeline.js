'use strict';

import v from 'validimir';

const dataPipeLineSchema = {
  _type: 'map',
  _hashKey: 'pipelineId',
  _required: ['pipelineId', 'pipelineName', 'dataset'],
  _meta: {
    throughput: {
      read: 5,
      write: 3
    },
    timestamps: true,
    useDocumentTypes: true
  },

  pipelineId: v().string(),
  pipelineName: v().string(),
  dataset: v().string(),

  // link to the list holding all files
  granules: v().string(),

  // The time processing started inside the pipeline
  // Basically when the ec2 machine is up and running commands
  timeStarted: v().date(),

  // The time processing finished inside the ec2 instance
  timeFinished: v().date(),
  deleted: v().boolean()
};

export default dataPipeLineSchema;
