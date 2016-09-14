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
    'name': 'AE20130908.Gabrielle.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.967Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Gabrielle/AE20130908.Gabrielle.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130908.Gabrielle.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20130908.Gabrielle.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.967Z',
    'updatedAt': '1970-01-18T01:21:25.967Z'
  }, {
    'name': 'AE20120910.Nadine.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.971Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Nadine/AE20120910.Nadine.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120910.Nadine.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20120910.Nadine.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.971Z',
    'updatedAt': '1970-01-18T01:21:25.971Z'
  }, {
    'name': 'AE20120913.Nadine.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.972Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Nadine/AE20120913.Nadine.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120913.Nadine.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20120913.Nadine.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.972Z',
    'updatedAt': '1970-01-18T01:21:25.972Z'
  }, {
    'name': 'AE20130905.Lorena.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.971Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Lorena/AE20130905.Lorena.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130905.Lorena.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20130905.Lorena.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.971Z',
    'updatedAt': '1970-01-18T01:21:25.971Z'
  }, {
    'name': 'AE20130913.Ingrid.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.969Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Ingrid/AE20130913.Ingrid.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130913.Ingrid.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20130913.Ingrid.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.969Z',
    'updatedAt': '1970-01-18T01:21:25.969Z'
  }, {
    'name': 'AE20120907.Leslie.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.970Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Leslie/AE20120907.Leslie.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120907.Leslie.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20120907.Leslie.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.970Z',
    'updatedAt': '1970-01-18T01:21:25.970Z'
  }, {
    'name': 'AE20140825.Cristobal.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.963Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Cristobal/AE20140825.Cristobal.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140825.Cristobal.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20140825.Cristobal.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.963Z',
    'updatedAt': '1970-01-18T01:21:25.963Z'
  }, {
    'name': 'AE20120927.Nadine.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.972Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Nadine/AE20120927.Nadine.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120927.Nadine.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20120927.Nadine.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.972Z',
    'updatedAt': '1970-01-18T01:21:25.972Z'
  }, {
    'name': 'AE20120916.Nadine.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.972Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Nadine/AE20120916.Nadine.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120916.Nadine.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20120916.Nadine.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.972Z',
    'updatedAt': '1970-01-18T01:21:25.972Z'
  }, {
    'name': 'AE20130915.Ingrid.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.969Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Ingrid/AE20130915.Ingrid.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130915.Ingrid.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20130915.Ingrid.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.969Z',
    'updatedAt': '1970-01-18T01:21:25.969Z'
  }, {
    'name': 'AE20141018.Gonzalo.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.967Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Gonzalo/AE20141018.Gonzalo.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20141018.Gonzalo.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20141018.Gonzalo.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.967Z',
    'updatedAt': '1970-01-18T01:21:25.967Z'
  }, {
    'name': 'AE20120831.Leslie.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.970Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Leslie/AE20120831.Leslie.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120831.Leslie.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20120831.Leslie.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.970Z',
    'updatedAt': '1970-01-18T01:21:25.970Z'
  }, {
    'name': 'AE20130817.Erin.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.965Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Erin/AE20130817.Erin.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130817.Erin.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20130817.Erin.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.965Z',
    'updatedAt': '1970-01-18T01:21:25.965Z'
  }, {
    'name': 'AE20130913.Humberto.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.968Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Humberto/AE20130913.Humberto.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130913.Humberto.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20130913.Humberto.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.968Z',
    'updatedAt': '1970-01-18T01:21:25.968Z'
  }, {
    'name': 'AE20130913.Gabrielle.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.967Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Gabrielle/AE20130913.Gabrielle.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130913.Gabrielle.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20130913.Gabrielle.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.967Z',
    'updatedAt': '1970-01-18T01:21:25.967Z'
  }, {
    'name': 'AE20140901.Dolly.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.964Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Dolly/AE20140901.Dolly.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140901.Dolly.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20140901.Dolly.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.964Z',
    'updatedAt': '1970-01-18T01:21:25.964Z'
  }, {
    'name': 'AE20130818.Erin.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.965Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Erin/AE20130818.Erin.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130818.Erin.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20130818.Erin.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.965Z',
    'updatedAt': '1970-01-18T01:21:25.965Z'
  }, {
    'name': 'AE20140912.Edouard.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.964Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Edouard/AE20140912.Edouard.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140912.Edouard.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20140912.Edouard.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.964Z',
    'updatedAt': '1970-01-18T01:21:25.964Z'
  }, {
    'name': 'AE20130912.Gabrielle.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.967Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Gabrielle/AE20130912.Gabrielle.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130912.Gabrielle.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20130912.Gabrielle.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.967Z',
    'updatedAt': '1970-01-18T01:21:25.967Z'
  }, {
    'name': 'AE20130911.Humberto.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.968Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Humberto/AE20130911.Humberto.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130911.Humberto.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20130911.Humberto.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.968Z',
    'updatedAt': '1970-01-18T01:21:25.968Z'
  }, {
    'name': 'AE20120905.Leslie.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.970Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Leslie/AE20120905.Leslie.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120905.Leslie.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20120905.Leslie.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.970Z',
    'updatedAt': '1970-01-18T01:21:25.970Z'
  }, {
    'name': 'AE20141015.Gonzalo.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.967Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Gonzalo/AE20141015.Gonzalo.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20141015.Gonzalo.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20141015.Gonzalo.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.967Z',
    'updatedAt': '1970-01-18T01:21:25.967Z'
  }, {
    'name': 'AE20141014.Gonzalo.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.967Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Gonzalo/AE20141014.Gonzalo.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20141014.Gonzalo.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20141014.Gonzalo.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.967Z',
    'updatedAt': '1970-01-18T01:21:25.967Z'
  }, {
    'name': 'AE20121004.Nadine.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.972Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Nadine/AE20121004.Nadine.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20121004.Nadine.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20121004.Nadine.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.972Z',
    'updatedAt': '1970-01-18T01:21:25.972Z'
  }, {
    'name': 'AE20120926.Nadine.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.972Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Nadine/AE20120926.Nadine.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120926.Nadine.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20120926.Nadine.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.972Z',
    'updatedAt': '1970-01-18T01:21:25.972Z'
  }, {
    'name': 'AE20140903.Dolly.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.964Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Dolly/AE20140903.Dolly.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140903.Dolly.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20140903.Dolly.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.964Z',
    'updatedAt': '1970-01-18T01:21:25.964Z'
  }, {
    'name': 'AE20120830.Leslie.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.970Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Leslie/AE20120830.Leslie.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120830.Leslie.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20120830.Leslie.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.970Z',
    'updatedAt': '1970-01-18T01:21:25.970Z'
  }, {
    'name': 'AE20130830.Kiko.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.969Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Kiko/AE20130830.Kiko.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130830.Kiko.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20130830.Kiko.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.969Z',
    'updatedAt': '1970-01-18T01:21:25.969Z'
  }, {
    'name': 'AE20140910.Edouard.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.964Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Edouard/AE20140910.Edouard.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140910.Edouard.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20140910.Edouard.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.964Z',
    'updatedAt': '1970-01-18T01:21:25.964Z'
  }, {
    'name': 'AE20140823.Cristobal.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.963Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Cristobal/AE20140823.Cristobal.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140823.Cristobal.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20140823.Cristobal.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.963Z',
    'updatedAt': '1970-01-18T01:21:25.963Z'
  }, {
    'name': 'AE20141019.Gonzalo.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.967Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Gonzalo/AE20141019.Gonzalo.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20141019.Gonzalo.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20141019.Gonzalo.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.967Z',
    'updatedAt': '1970-01-18T01:21:25.967Z'
  }, {
    'name': 'AE20130914.Ingrid.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.969Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Ingrid/AE20130914.Ingrid.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130914.Ingrid.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20130914.Ingrid.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.969Z',
    'updatedAt': '1970-01-18T01:21:25.969Z'
  }, {
    'name': 'AE20120908.Leslie.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.970Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Leslie/AE20120908.Leslie.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120908.Leslie.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20120908.Leslie.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.970Z',
    'updatedAt': '1970-01-18T01:21:25.970Z'
  }, {
    'name': 'AE20141011.Gonzalo.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.967Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Gonzalo/AE20141011.Gonzalo.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20141011.Gonzalo.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20141011.Gonzalo.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.967Z',
    'updatedAt': '1970-01-18T01:21:25.967Z'
  }, {
    'name': 'AE20140919.Edouard.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.964Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Edouard/AE20140919.Edouard.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140919.Edouard.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20140919.Edouard.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.964Z',
    'updatedAt': '1970-01-18T01:21:25.964Z'
  }, {
    'name': 'AE20120914.Nadine.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.972Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Nadine/AE20120914.Nadine.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120914.Nadine.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20120914.Nadine.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.972Z',
    'updatedAt': '1970-01-18T01:21:25.972Z'
  }, {
    'name': 'AE20130916.Ingrid.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.969Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Ingrid/AE20130916.Ingrid.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130916.Ingrid.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20130916.Ingrid.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.969Z',
    'updatedAt': '1970-01-18T01:21:25.969Z'
  }, {
    'name': 'AE20130909.Gabrielle.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.967Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Gabrielle/AE20130909.Gabrielle.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130909.Gabrielle.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20130909.Gabrielle.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.967Z',
    'updatedAt': '1970-01-18T01:21:25.967Z'
  }, {
    'name': 'AE20140914.Edouard.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.964Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Edouard/AE20140914.Edouard.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140914.Edouard.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20140914.Edouard.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.964Z',
    'updatedAt': '1970-01-18T01:21:25.964Z'
  }, {
    'name': 'AE20120910.Leslie.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.970Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Leslie/AE20120910.Leslie.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120910.Leslie.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20120910.Leslie.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.970Z',
    'updatedAt': '1970-01-18T01:21:25.970Z'
  }, {
    'name': 'AE20120904.Leslie.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.970Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Leslie/AE20120904.Leslie.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120904.Leslie.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20120904.Leslie.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.970Z',
    'updatedAt': '1970-01-18T01:21:25.970Z'
  }, {
    'name': 'AE20120928.Nadine.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.972Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Nadine/AE20120928.Nadine.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120928.Nadine.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20120928.Nadine.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.972Z',
    'updatedAt': '1970-01-18T01:21:25.972Z'
  }, {
    'name': 'AE20130917.Ingrid.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.969Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Ingrid/AE20130917.Ingrid.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130917.Ingrid.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20130917.Ingrid.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.969Z',
    'updatedAt': '1970-01-18T01:21:25.969Z'
  }, {
    'name': 'AE20121002.Nadine.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.972Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Nadine/AE20121002.Nadine.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20121002.Nadine.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20121002.Nadine.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.972Z',
    'updatedAt': '1970-01-18T01:21:25.972Z'
  }, {
    'name': 'AE20120906.Leslie.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.970Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Leslie/AE20120906.Leslie.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120906.Leslie.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20120906.Leslie.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.970Z',
    'updatedAt': '1970-01-18T01:21:25.970Z'
  }, {
    'name': 'AE20140902.Cristobal.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.963Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Cristobal/AE20140902.Cristobal.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140902.Cristobal.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20140902.Cristobal.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.963Z',
    'updatedAt': '1970-01-18T01:21:25.963Z'
  }, {
    'name': 'AE20141011.Fay.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.966Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Fay/AE20141011.Fay.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20141011.Fay.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20141011.Fay.loc.nc'],
    'lastModified': '1970-01-17T16:20:38.400Z',
    'createdAt': '1970-01-18T01:21:25.966Z',
    'updatedAt': '1970-01-18T01:21:25.966Z'
  }, {
    'name': 'AE20130908.Lorena.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.971Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Lorena/AE20130908.Lorena.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130908.Lorena.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20130908.Lorena.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.971Z',
    'updatedAt': '1970-01-18T01:21:25.971Z'
  }, {
    'name': 'AE20130916.Humberto.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.968Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Humberto/AE20130916.Humberto.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130916.Humberto.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20130916.Humberto.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.968Z',
    'updatedAt': '1970-01-18T01:21:25.968Z'
  }, {
    'name': 'AE20140917.Edouard.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.964Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Edouard/AE20140917.Edouard.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140917.Edouard.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20140917.Edouard.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.964Z',
    'updatedAt': '1970-01-18T01:21:25.964Z'
  }, {
    'name': 'AE20140904.Dolly.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.964Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Dolly/AE20140904.Dolly.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140904.Dolly.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20140904.Dolly.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.964Z',
    'updatedAt': '1970-01-18T01:21:25.964Z'
  }, {
    'name': 'AE20140902.Dolly.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.964Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Dolly/AE20140902.Dolly.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140902.Dolly.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20140902.Dolly.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.964Z',
    'updatedAt': '1970-01-18T01:21:25.964Z'
  }, {
    'name': 'AE20130829.Kiko.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.969Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Kiko/AE20130829.Kiko.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130829.Kiko.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20130829.Kiko.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.969Z',
    'updatedAt': '1970-01-18T01:21:25.969Z'
  }, {
    'name': 'AE20140918.Edouard.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.964Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Edouard/AE20140918.Edouard.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140918.Edouard.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20140918.Edouard.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.964Z',
    'updatedAt': '1970-01-18T01:21:25.964Z'
  }, {
    'name': 'AE20140911.Edouard.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.964Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Edouard/AE20140911.Edouard.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20140911.Edouard.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20140911.Edouard.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.964Z',
    'updatedAt': '1970-01-18T01:21:25.964Z'
  }, {
    'name': 'AE20141016.Gonzalo.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.967Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Gonzalo/AE20141016.Gonzalo.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20141016.Gonzalo.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20141016.Gonzalo.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.967Z',
    'updatedAt': '1970-01-18T01:21:25.967Z'
  }, {
    'name': 'AE20130908.Humberto.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.968Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Humberto/AE20130908.Humberto.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20130908.Humberto.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20130908.Humberto.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.968Z',
    'updatedAt': '1970-01-18T01:21:25.968Z'
  }, {
    'name': 'AE20141020.Gonzalo.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.968Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Gonzalo/AE20141020.Gonzalo.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20141020.Gonzalo.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20141020.Gonzalo.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.968Z',
    'updatedAt': '1970-01-18T01:21:25.968Z'
  }, {
    'name': 'AE20120920.Nadine.loc',
    'waitForPipelineSince': '1970-01-18T01:21:25.972Z',
    'sourceFiles': ['ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Nadine/AE20120920.Nadine.loc'],
    'sourceS3Uris': ['s3://cumulus-ghrc-raw/wwlln/AE20120920.Nadine.loc'],
    'destinationS3Uris': ['s3://cumulus-ghrc-archive/wwlln/AE20120920.Nadine.loc.nc'],
    'lastModified': '1970-01-17T15:28:48.000Z',
    'createdAt': '1970-01-18T01:21:25.972Z',
    'updatedAt': '1970-01-18T01:21:25.972Z'
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

if (require.main === module) {
  populateDataSets(null, function (err) {
    console.log(err);
    console.log('all done');
  });
}

module.exports.populateDataSets = populateDataSets;
module.exports.populateGranules = populateGranules;
