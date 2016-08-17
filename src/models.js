'use strict';

var dynamoose = require('dynamoose');

// Schema for DAAC datasets
var dataSetSchema = module.exports.dataSetSchema = new dynamoose.Schema({
  name: {
    // The name of the data set, e.g. WWLLN
    type: String,
    hashKey: true
  },
  shortName: {
    // the short_name/concept_id needed for getting collection level metadata
    type: String,
    required: true
  },
  daacName: {
    // Name of the DAAC, e.g. Global Hydrology Resource Center DAAC
    type: String,
    required: true
  },
  sourceDataBucket: {
    // The bucket where source data is stored
    type: 'map',
    map: {
      bucketName: {
        type: String,
        required:true
      },
      prefix: {
        type: String,
        required:true
      },
      granulesFiles: {
        type: Number
      }
    }
  },
  destinationDataBucket: {
    // the bucket where destination data is stored
    type: 'map',
    map: {
      bucketName: {
        type: String,
        required:true
      },
      prefix: {
        type: String,
        required:true
      },
      granulesFiles: {
        type: Number
      }
    }
  },
  dataPipeLine: {
    // data pipeline details
    type: 'map',
    map: {
      templateUri: {
        type: String,
        required: true
      },
      batchLimit: {
        type: Number,
        default: 100
      }
    }
  }
},
{
  throughput: {
    read: 15,
    write: 10,
  },
  timestamps: true,
  useDocumentTypes: true
});

// Schema for granule datasets
var granuleSchema = module.exports.granuleSchema  = new dynamoose.Schema({
  name: {
    // the unique granule name
    type: String,
    hashKey: true,
    index: {
      global: true,
      hashKey: 'name',
      rangeKey: 'waitForPipelineSince',
      name: 'pipelineIndex',
      throughput: 10
    }
  },
  waitForPipelineSince: {
    type: Date,
    default: Date.now,
  },
  sourceFiles: {
    // list of source files on DAAC servers
    type: 'list',
    list: [
      {
        type: String
      }
    ],
    required: true
  },
  sourceS3Uris: {
    // list of source files on DAAC servers
    type: 'list',
    list: [
      {
        type: String
      }
    ],
    required: true
  },
  destinationS3Uris: {
    // list of source files on DAAC servers
    type: 'list',
    list: [
      {
        type: String
      }
    ]
  },
  sentToPipeLine: {
    type: Boolean,
    default: false
  },
  lastModified: {
    type: Number
  }
},
{
  throughput: {
    read: 15,
    write: 10,
  },
  timestamps: true,
  useDocumentTypes: true
});
