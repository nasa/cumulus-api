'use strict';

var steed = require('steed')();
var dynamoose = require('dynamoose');
var tables = require('./tables');
var models = require('./models');
var avaps = require('./pipeline/avaps');
var wwlln = require('./pipeline/wwlln');

var populateDataSets = function (records, callback) {
  if (!records) {
    records = [wwlln, avaps];
  }

  var Dataset = dynamoose.model(
    tables.datasetTableName,
    models.dataSetSchema,
    {create: true}
  );

  steed.map(records, function (record, cb) {
    var newRecord = new Dataset(record);
    newRecord.save(function (err) {
      if (err) {
        return cb(err);
      }
      console.log(`${record.name} saved!`);
      cb(null);
    });
  }, function (err) {
    callback(err);
  });
};

var populateGranules = function (callback) {
  var records = [{
    'name': 'AE20130918.Humberto.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.776Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Humberto/AE20130918.Humberto.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130918.Humberto.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.776Z',
    'updatedAt': '1970-01-18T01:16:02.776Z'
  }, {
    'name': 'AE20130906.Gabrielle.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.775Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Gabrielle/AE20130906.Gabrielle.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130906.Gabrielle.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.775Z',
    'updatedAt': '1970-01-18T01:16:02.775Z'
  }, {
    'name': 'AE20120828.Leslie.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.776Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Leslie/AE20120828.Leslie.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120828.Leslie.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.776Z',
    'updatedAt': '1970-01-18T01:16:02.776Z'
  }, {
    'name': 'AE20130904.Lorena.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.777Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Lorena/AE20130904.Lorena.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130904.Lorena.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.777Z',
    'updatedAt': '1970-01-18T01:16:02.777Z'
  }, {
    'name': 'AE20120918.Nadine.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.777Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Nadine/AE20120918.Nadine.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120918.Nadine.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.777Z',
    'updatedAt': '1970-01-18T01:16:02.777Z'
  }, {
    'name': 'AE20141012.Fay.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.774Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Fay/AE20141012.Fay.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20141012.Fay.loc'],
    'lastModified': '1970-01-17T16:20:38.400Z',
    'createdAt': '1970-01-18T01:16:02.774Z',
    'updatedAt': '1970-01-18T01:16:02.774Z'
  }, {
    'name': 'AE20120912.Nadine.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.777Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Nadine/AE20120912.Nadine.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120912.Nadine.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.777Z',
    'updatedAt': '1970-01-18T01:16:02.777Z'
  }, {
    'name': 'AE20120912.Leslie.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.776Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Leslie/AE20120912.Leslie.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120912.Leslie.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.776Z',
    'updatedAt': '1970-01-18T01:16:02.776Z'
  }, {
    'name': 'AE20140901.Cristobal.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.773Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Cristobal/AE20140901.Cristobal.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140901.Cristobal.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.773Z',
    'updatedAt': '1970-01-18T01:16:02.773Z'
  }, {
    'name': 'AE20141017.Gonzalo.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.775Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Gonzalo/AE20141017.Gonzalo.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20141017.Gonzalo.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.775Z',
    'updatedAt': '1970-01-18T01:16:02.775Z'
  }, {
    'name': 'AE20140830.Cristobal.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.773Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Cristobal/AE20140830.Cristobal.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140830.Cristobal.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.773Z',
    'updatedAt': '1970-01-18T01:16:02.773Z'
  }, {
    'name': 'AE20120930.Nadine.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.777Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Nadine/AE20120930.Nadine.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120930.Nadine.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.777Z',
    'updatedAt': '1970-01-18T01:16:02.777Z'
  }, {
    'name': 'AE20140913.Edouard.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.774Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Edouard/AE20140913.Edouard.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140913.Edouard.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.774Z',
    'updatedAt': '1970-01-18T01:16:02.774Z'
  }, {
    'name': 'AE20130825.Fernand.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.775Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Fernand/AE20130825.Fernand.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130825.Fernand.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.775Z',
    'updatedAt': '1970-01-18T01:16:02.775Z'
  }, {
    'name': 'AE20120919.Nadine.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.777Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Nadine/AE20120919.Nadine.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120919.Nadine.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.777Z',
    'updatedAt': '1970-01-18T01:16:02.777Z'
  }, {
    'name': 'AE20140827.Cristobal.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.773Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Cristobal/AE20140827.Cristobal.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140827.Cristobal.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.773Z',
    'updatedAt': '1970-01-18T01:16:02.773Z'
  }, {
    'name': 'AE20130914.Humberto.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.776Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Humberto/AE20130914.Humberto.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130914.Humberto.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.776Z',
    'updatedAt': '1970-01-18T01:16:02.776Z'
  }, {
    'name': 'AE20140916.Edouard.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.774Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Edouard/AE20140916.Edouard.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140916.Edouard.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.774Z',
    'updatedAt': '1970-01-18T01:16:02.774Z'
  }, {
    'name': 'AE20130815.Erin.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.774Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Erin/AE20130815.Erin.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130815.Erin.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.774Z',
    'updatedAt': '1970-01-18T01:16:02.774Z'
  }, {
    'name': 'AE20120829.Leslie.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.776Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Leslie/AE20120829.Leslie.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120829.Leslie.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.776Z',
    'updatedAt': '1970-01-18T01:16:02.776Z'
  }, {
    'name': 'AE20140920.Edouard.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.774Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Edouard/AE20140920.Edouard.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140920.Edouard.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.774Z',
    'updatedAt': '1970-01-18T01:16:02.774Z'
  }, {
    'name': 'AE20130915.Humberto.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.776Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Humberto/AE20130915.Humberto.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130915.Humberto.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.776Z',
    'updatedAt': '1970-01-18T01:16:02.776Z'
  }, {
    'name': 'AE20140831.Cristobal.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.773Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Cristobal/AE20140831.Cristobal.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140831.Cristobal.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.773Z',
    'updatedAt': '1970-01-18T01:16:02.773Z'
  }, {
    'name': 'AE20140828.Cristobal.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.773Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Cristobal/AE20140828.Cristobal.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140828.Cristobal.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.773Z',
    'updatedAt': '1970-01-18T01:16:02.773Z'
  }, {
    'name': 'AE20120915.Nadine.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.777Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Nadine/AE20120915.Nadine.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120915.Nadine.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.777Z',
    'updatedAt': '1970-01-18T01:16:02.777Z'
  }, {
    'name': 'AE20140824.Cristobal.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.773Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Cristobal/AE20140824.Cristobal.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140824.Cristobal.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.773Z',
    'updatedAt': '1970-01-18T01:16:02.773Z'
  }, {
    'name': 'AE20120902.Leslie.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.776Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Leslie/AE20120902.Leslie.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120902.Leslie.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.776Z',
    'updatedAt': '1970-01-18T01:16:02.776Z'
  }, {
    'name': 'AE20130909.Lorena.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.777Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Lorena/AE20130909.Lorena.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130909.Lorena.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.777Z',
    'updatedAt': '1970-01-18T01:16:02.777Z'
  }, {
    'name': 'AE20140829.Cristobal.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.773Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Cristobal/AE20140829.Cristobal.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140829.Cristobal.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.773Z',
    'updatedAt': '1970-01-18T01:16:02.773Z'
  }, {
    'name': 'AE20130917.Humberto.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.776Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Humberto/AE20130917.Humberto.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130917.Humberto.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.776Z',
    'updatedAt': '1970-01-18T01:16:02.776Z'
  }, {
    'name': 'AE20120923.Nadine.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.777Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Nadine/AE20120923.Nadine.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120923.Nadine.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.777Z',
    'updatedAt': '1970-01-18T01:16:02.777Z'
  }, {
    'name': 'AE20130831.Kiko.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.776Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Kiko/AE20130831.Kiko.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130831.Kiko.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.776Z',
    'updatedAt': '1970-01-18T01:16:02.776Z'
  }, {
    'name': 'AE20141013.Gonzalo.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.775Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Gonzalo/AE20141013.Gonzalo.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20141013.Gonzalo.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.775Z',
    'updatedAt': '1970-01-18T01:16:02.775Z'
  }, {
    'name': 'AE20130905.Gabrielle.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.775Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Gabrielle/AE20130905.Gabrielle.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130905.Gabrielle.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.775Z',
    'updatedAt': '1970-01-18T01:16:02.775Z'
  }, {
    'name': 'AE20120901.Leslie.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.776Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Leslie/AE20120901.Leslie.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120901.Leslie.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.776Z',
    'updatedAt': '1970-01-18T01:16:02.776Z'
  }, {
    'name': 'AE20130912.Humberto.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.776Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Humberto/AE20130912.Humberto.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130912.Humberto.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.776Z',
    'updatedAt': '1970-01-18T01:16:02.776Z'
  }, {
    'name': 'AE20121003.Nadine.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.777Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Nadine/AE20121003.Nadine.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20121003.Nadine.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.777Z',
    'updatedAt': '1970-01-18T01:16:02.777Z'
  }, {
    'name': 'AE20130826.Fernand.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.775Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Fernand/AE20130826.Fernand.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130826.Fernand.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.775Z',
    'updatedAt': '1970-01-18T01:16:02.775Z'
  }, {
    'name': 'AE20141012.Gonzalo.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.775Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Gonzalo/AE20141012.Gonzalo.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20141012.Gonzalo.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.775Z',
    'updatedAt': '1970-01-18T01:16:02.775Z'
  }, {
    'name': 'AE20120911.Nadine.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.777Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Nadine/AE20120911.Nadine.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120911.Nadine.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.777Z',
    'updatedAt': '1970-01-18T01:16:02.777Z'
  }, {
    'name': 'AE20130906.Lorena.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.777Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Lorena/AE20130906.Lorena.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130906.Lorena.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.777Z',
    'updatedAt': '1970-01-18T01:16:02.777Z'
  }, {
    'name': 'AE20130908.Gabrielle.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.775Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Gabrielle/AE20130908.Gabrielle.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130908.Gabrielle.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.775Z',
    'updatedAt': '1970-01-18T01:16:02.775Z'
  }, {
    'name': 'AE20120910.Nadine.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.777Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Nadine/AE20120910.Nadine.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120910.Nadine.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.777Z',
    'updatedAt': '1970-01-18T01:16:02.777Z'
  }, {
    'name': 'AE20120913.Nadine.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.777Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Nadine/AE20120913.Nadine.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120913.Nadine.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.777Z',
    'updatedAt': '1970-01-18T01:16:02.777Z'
  }, {
    'name': 'AE20130905.Lorena.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.777Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Lorena/AE20130905.Lorena.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130905.Lorena.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.777Z',
    'updatedAt': '1970-01-18T01:16:02.777Z'
  }, {
    'name': 'AE20130913.Ingrid.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.776Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Ingrid/AE20130913.Ingrid.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130913.Ingrid.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.776Z',
    'updatedAt': '1970-01-18T01:16:02.776Z'
  }, {
    'name': 'AE20120907.Leslie.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.776Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Leslie/AE20120907.Leslie.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120907.Leslie.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.776Z',
    'updatedAt': '1970-01-18T01:16:02.776Z'
  }, {
    'name': 'AE20140825.Cristobal.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.773Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Cristobal/AE20140825.Cristobal.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140825.Cristobal.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.773Z',
    'updatedAt': '1970-01-18T01:16:02.773Z'
  }, {
    'name': 'AE20120927.Nadine.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.777Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Nadine/AE20120927.Nadine.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120927.Nadine.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.777Z',
    'updatedAt': '1970-01-18T01:16:02.777Z'
  }, {
    'name': 'AE20120916.Nadine.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.777Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Nadine/AE20120916.Nadine.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120916.Nadine.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.777Z',
    'updatedAt': '1970-01-18T01:16:02.777Z'
  }, {
    'name': 'AE20130915.Ingrid.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.776Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Ingrid/AE20130915.Ingrid.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130915.Ingrid.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.776Z',
    'updatedAt': '1970-01-18T01:16:02.776Z'
  }, {
    'name': 'AE20141018.Gonzalo.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.775Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Gonzalo/AE20141018.Gonzalo.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20141018.Gonzalo.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.775Z',
    'updatedAt': '1970-01-18T01:16:02.775Z'
  }, {
    'name': 'AE20120831.Leslie.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.776Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Leslie/AE20120831.Leslie.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120831.Leslie.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.776Z',
    'updatedAt': '1970-01-18T01:16:02.776Z'
  }, {
    'name': 'AE20130817.Erin.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.774Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Erin/AE20130817.Erin.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130817.Erin.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.774Z',
    'updatedAt': '1970-01-18T01:16:02.774Z'
  }, {
    'name': 'AE20130913.Humberto.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.776Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Humberto/AE20130913.Humberto.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130913.Humberto.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.776Z',
    'updatedAt': '1970-01-18T01:16:02.776Z'
  }, {
    'name': 'AE20130913.Gabrielle.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.775Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Gabrielle/AE20130913.Gabrielle.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130913.Gabrielle.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.775Z',
    'updatedAt': '1970-01-18T01:16:02.775Z'
  }, {
    'name': 'AE20140901.Dolly.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.774Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Dolly/AE20140901.Dolly.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140901.Dolly.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.774Z',
    'updatedAt': '1970-01-18T01:16:02.774Z'
  }, {
    'name': 'AE20130818.Erin.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.774Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Erin/AE20130818.Erin.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130818.Erin.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.774Z',
    'updatedAt': '1970-01-18T01:16:02.774Z'
  }, {
    'name': 'AE20140912.Edouard.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.774Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Edouard/AE20140912.Edouard.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140912.Edouard.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.774Z',
    'updatedAt': '1970-01-18T01:16:02.774Z'
  }, {
    'name': 'AE20130912.Gabrielle.loc',
    'waitForPipelineSince': '1970-01-18T01:16:02.775Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Gabrielle/AE20130912.Gabrielle.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130912.Gabrielle.loc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:16:02.775Z',
    'updatedAt': '1970-01-18T01:16:02.775Z'
  }];

  var Granule = dynamoose.model(
    tables.granulesTablePrefix + 'wwlln',
    models.granuleSchema,
    {create: true}
  );

  steed.map(records, function (record, cb) {
    var newRecord = new Granule(record);
    newRecord.save(function (err) {
      if (err) {
        return cb(err);
      }
      console.log(`${record.name} saved!`);
      cb(null);
    });
  }, function (err) {
    callback(err);
  });
};

// populateDataSets(null, function (err) {
//   console.log(err);
//   console.log('all done');
// });

module.exports.populateDataSets = populateDataSets;
module.exports.populateGranules = populateGranules;
