'use strict';

var should = require('should');
var dynamoose = require('dynamoose');

// Use local instance of dynamodb (must run on port 8000)
dynamoose.local();

// set env variables
var datasetTableName = 'cumulus_test_datasets';
var granulesTablePrefix = 'cumulus_test_granules_';

process.env.DATASET_TABLE_NAME = datasetTableName;
process.env.GRANULES_PREFIX = granulesTablePrefix;

var cont = require('../src/controllers');
var models = require('../src/models');


describe('Test controllers', function (){
  this.timeout(10000);

  var Dataset;
  var GranulesWWLN;
  var testDataSetRecord = 'WWLLN'
  var sampleRecord = {
      name: testDataSetRecord,
      shortName: testDataSetRecord,
      daacName: 'Global Hydrology Resource Center DAAC',
      sourceDataBucket: {
        bucketName: 'cumulus-staging',
        prefix: 'wwlln/source/',
        granulesFiles: 1
      },
      destinationDataBucket: {
        bucketName: 'cumulus-staging',
        prefix: 'wwlln/processed/',
        granulesFiles: 3
      },
      dataPipeLine: {
        templateUri: 's3://cumulus-staging/wwlln.json',
        batchLimit: 20
      }
  };

  var sampleGranule = {
    "lastModified": 1438142400,
    "name": "AE20140901.Cristobal.loc",
    "sourceFiles": [
      "ftp://hs3.nsstc.nasa.gov/pub/hs3/WWLLN/data/txt/Cristobal/AE20140901.Cristobal.loc"
    ],
    "sourceS3Uris": [
      "s3://cumulus-source/source-data/wwlln/AE20140901.Cristobal.loc"
    ],
    "waitForPipelineSince": 1471460282
  }


  before(function(done) {
    // Create the tables
    Dataset = dynamoose.model(datasetTableName, models.dataSetSchema, {create: true});
    GranulesWWLN = dynamoose.model(granulesTablePrefix + 'wwlln', models.granuleSchema, {create: true});

    // Add new dataset record for testing
    var newRecord = new Dataset(sampleRecord);

    // Add granules
    var newGranule = new GranulesWWLN(sampleGranule);

    // save all
    newRecord.save()
             .then(
      newGranule.save(function () {
        done();
      })
    );
  });

  describe('Test dataset controllers', function (){
    it('should list all datasets', function (done) {
      cont.listDataSets({}, function (err, datasets) {
        should.not.exist(err);
        should.equal(datasets.length, 1);
        should.equal(datasets[0].name, testDataSetRecord);
        done()
      });
    });

    it('should return a particular dataset', function (done) {
      cont.getDataSet({
        path: {
          short_name: testDataSetRecord
        }
      }, function (err, dataset) {
        should.not.exist(err);
        dataset.should.be.instanceOf(Object);
        should.equal(dataset.name, testDataSetRecord);
        done()
      });
    });

    it('should return nothing', function (done) {
      cont.getDataSet({
        path: {
          short_name: 'something'
        }
      }, function (err, dataset) {
        err.should.equal('Record was not found')
        done()
      });
    });

    it('should add one record', function (done) {
      sampleRecord.name = 'WWLLN2'

      cont.postDataSet({
        body: sampleRecord,
        headers: {
          Token: 'thisisatesttoken'
        }
      }, function (err, dataset) {
        should.not.exist(err);
        dataset.should.equal(sampleRecord)
        done()
      });
    });

    it('should have two records', function (done) {
      cont.listDataSets({}, function (err, datasets) {
        should.not.exist(err);
        should.equal(datasets.length, 2);
        done()
      });
    });
  });

  describe('Test granules controllers', function (){
    it('should list all datasets', function (done) {
      cont.listGranules({
        path: {
          dataSet: 'WWLLN'
        }
      }, function (err, granules) {
        should.not.exist(err);
        should.equal(granules.length, 1);
        should.equal(granules[0].name, sampleGranule.name);
        done()
      });
    });

    it('should return error if wrong dataset name is provided', function (done) {
      cont.listGranules({
        path: {
          dataSet: 'WWLLN2222'
        }
      }, function (err, granules) {
        err.should.be.equal('Requested dataset (WWLLN2222) doesn\'t exist')
        done()
      });
    });

    it('should get a particular granule', function (done) {
      cont.getGranules({
        path: {
          dataSet: 'WWLLN',
          granuleName: sampleGranule.name
        }
      }, function (err, granule) {
        should.not.exist(err);
        granule.name.should.be.equal(sampleGranule.name)
        done()
      });
    });

    it('should return error when particular granule is not found', function (done) {
      cont.getGranules({
        path: {
          dataSet: 'WWLLN',
          granuleName: 'something'
        }
      }, function (err, granule) {
        err.should.be.equal('Record was not found')
        done()
      });
    });

  });

  after(function(done) {
    Dataset.$__.table.delete(function (err) {
      done();
    });
  });
});
