'use strict';
/*
var proxyquire = require('proxyquire').noPreserveCache();
var steed = require('steed')();
var should = require('should');
var dynamoose = require('dynamoose');

// Use local instance of dynamodb (must run on port 8000)
dynamoose.AWS.config.update({
  accessKeyId: 'AKID',
  secretAccessKey: 'SECRET',
  region: 'us-east-1'
});

var tb = {
  datasetTableName: 'cumulus_test_triggers_datasets',
  granulesTablePrefix: 'cumulus_test_triggers_granules_'
};

var mockTable = {
  './tables': tb
};

dynamoose.local();

var schemas = require('../src/models/schemas');
var triggers = require('../src/triggers');
var fixtures = proxyquire('../src/models/fixtures', mockTable);

describe('Test Triggers', function () {
  this.timeout(10000);
  var Dataset;
  var GranulesWWLN;

  before(function (done) {
    Dataset = dynamoose.model(tb.datasetTableName, schemas.dataSetSchema, {create: true, waitForActive: true});
    GranulesWWLN = dynamoose.model(tb.granulesTablePrefix + 'wwlln', schemas.granuleSchema, {create: true, waitForActive: true});

    steed.parallel([
      function (cb) {
        fixtures.populateDataSets(null, cb);
      },
      function (cb) {
        fixtures.populateGranules(cb);
      }
    ], function (err) {
      done(err);
    });
  });

  it('test payload generation', function (done) {
    steed.waterfall([
      function (cb) {
        Dataset.query('name').eq('wwlln').exec(cb);
      },
      function (dataset, cb) {
        GranulesWWLN.scan().exec(function (err, records) {
          var payload = triggers.generatePayload(dataset[0], records);
          payload.length.should.be.equal(2);
          payload[0].datasetName.should.be.equal(dataset[0].name);
          payload[0].granules[0].should.have.property('destinationS3Uris');
          cb(err);
        });
      }
    ], function (err) {
      done(err);
    });
  });

  after(function (done) {
    Dataset.$__.table.delete(function (err) {
      should.not.exist(err);
      done();
    });
  });
});
*/
