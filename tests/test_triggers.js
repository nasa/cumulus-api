'use strict';

var _ = require('lodash');
var steed = require('steed')();
var should = require('should');
var dynamoose = require('dynamoose');

// Use local instance of dynamodb (must run on port 8000)
dynamoose.AWS.config.update({
  accessKeyId: 'AKID',
  secretAccessKey: 'SECRET',
  region: 'us-east-1'
});

dynamoose.local();

var datasetTableName = 'cumulus_test_datasets';
var granulesTablePrefix = 'cumulus_test_granules_';

process.env.DATASET_TABLE_NAME = datasetTableName;
process.env.GRANULES_PREFIX = granulesTablePrefix;

var tb = require('../src/tables');
var models = require('../src/models');
var triggers = require('../src/triggers');
var fixtures = require('../src/fixtures');

describe('Test Triggers', function () {
  this.timeout(10000);
  var Dataset;
  var GranulesWWLN;

  before(function (done) {
    Dataset = dynamoose.model(tb.datasetTableName, models.dataSetSchema, {create: true});
    GranulesWWLN = dynamoose.model(tb.granulesTablePrefix + 'wwlln', models.granuleSchema, {create: true});

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
        Dataset.query('name').eq('WWLLN').exec(cb);
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
