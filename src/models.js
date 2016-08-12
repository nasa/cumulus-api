var dynamoose = require('dynamoose');

// Schema for DAAC datasets
var dataSetSchema  = new dynamoose.Schema({
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
var granuleSchema  = new dynamoose.Schema({
  name: {
    // the unique granule name
    type: String,
    hashKey: true
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


// A DAAC data set, e.g. WWLN from HS3
module.exports.DataSet = dynamoose.model('DataSet', dataSetSchema, {create: false});

// WWLLN granules
module.exports.Wwlln = dynamoose.model('granules_WWLLN', granuleSchema, {create: false});

// var newRecord = new DataSet({
//     name: 'WWLLN',
//     shortName: 'WWLLN',
//     daacName: 'Global Hydrology Resource Center DAAC',
//     sourceDataBucket: {
//       bucketName: 'cumulus-staging',
//       prefix: 'wwlln/source/',
//       granulesFiles: 1
//     },
//     destinationDataBucket: {
//       bucketName: 'cumulus-staging',
//       prefix: 'wwlln/processed/',
//       granulesFiles: 3
//     },
//     dataPipeLine: {
//       templateUri: 's3://cumulus-staging/wwlln.json',
//       batchLimit: 20
//     }
// });

// newRecord.save();

// var newGranule = new Wwlln({
//   name: 'AE20140830.Cristobal.loc',
//   sourceFiles: [
//     'ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Cristobal/AE20140830.Cristobal.loc'
//   ],
//   sourceS3Uris: [
//     's3://testing-miles-wwlln/ftp%3A//hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Cristobal/AE20140823.Cristobal.loc'
//   ]
// })

// newGranule.save();
