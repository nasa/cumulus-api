'use strict';

var dynamoose = require('dynamoose');

// Schema for DAAC datasets
var dataSetSchema = new dynamoose.Schema(
  {
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
    versionId: {
      type: Number,
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
          required: true
        },
        prefix: {
          type: String,
          required: true
        },
        granulesFiles: {
          type: Number
        },
        format: {
          type: String
        }
      }
    },
    destinationDataBucket: {
      // the bucket where destination data is stored
      type: 'map',
      map: {
        bucketName: {
          type: String,
          required: true
        },
        prefix: {
          type: String,
          required: true
        },
        granulesFiles: {
          type: Number
        },
        format: {
          type: String
        }
      }
    },
    dataPipeLine: {
      // data pipeline details
      type: 'map',
      map: {
        template: {
          type: Object
        },
        parameters: {
          type: Object
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
      write: 10
    },
    timestamps: true,
    useDocumentTypes: true
  }
);

// Schema for granule datasets
var granuleSchema = new dynamoose.Schema(
  {
    name: {
      // the unique granule name
      type: String,
      hashKey: true
    },
    waitForPipelineSince: {
      type: Date,
      default: Date.now
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
      type: Date
    }
  },
  {
    throughput: {
      read: 15,
      write: 10
    },
    timestamps: true,
    useDocumentTypes: true
  }
);

// Schema for granule datasets
var dataPipeLineSchema = new dynamoose.Schema(
  {
    pipelineId: {
      type: String,
      hashKey: true
    },
    pipelineName: {
      type: String,
      required: true
    },
    dataset: {
      type: String,
      required: true
    },
    granules: {
      // link to the list holding all files
      type: String
    },
    timeStarted: {
      // The time processing started inside the pipeline
      // Basically when the ec2 machine is up and running commands
      type: Date
    },
    timeFinished: {
      // The time processing finished inside the ec2 instance
      type: Date
    },
    deleted: {
      type: Boolean
    }
  },
  {
    throughput: {
      read: 5,
      write: 3
    },
    timestamps: true,
    useDocumentTypes: true
  }
);

module.exports.dataSetSchema = dataSetSchema;
module.exports.granuleSchema = granuleSchema;
module.exports.dataPipeLineSchema = dataPipeLineSchema;
