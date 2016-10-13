'use strict';

process.env.ES_HOST = 'localhost';

var steed = require('steed')();
var _ = require('lodash');
var should = require('should');
var dynamoose = require('dynamoose');
var es = require('elasticsearch');
var proxyquire = require('proxyquire').noPreserveCache();

var esClient = new es.Client({
  // Defaults will work for our test instance
});

// Use local instance of dynamodb (must run on port 8000)
dynamoose.AWS.config.update({
  accessKeyId: 'AKID',
  secretAccessKey: 'SECRET',
  region: 'us-east-1'
});
dynamoose.local();

var tb = {
  datasetTableName: 'cumulus_test_controllers_datasets',
  granulesTablePrefix: 'cumulus_test_controllers_granules_',
  datapipelineTableName: 'cumulus_test_controllers_datapipelines'
};

var stubs = {
  '../models/tables': tb,
  '../splunk': {
    oneshotSearch: function (a, b, cb) {
      cb(null, {
        preview: false,
        init_offset: 0,
        messages: [],
        fields:
         [ { name: 'dataset_id', groupby_rank: '0' },
           { name: 'sum(is_error)' } ],
        results: [ { dataset_id: 'None', 'sum(is_error)': '0' } ],
        highlighted: {}
      });
    }
  }
};

var granules = proxyquire('../src/controllers/granules', stubs);
var errors = proxyquire('../src/controllers/errors', stubs);
var collections = proxyquire('../src/controllers/collections', stubs);
var schemas = require('../src/models/schemas');

var wwlln = proxyquire('../src/pipeline/wwlln', {});
var fixtures = proxyquire('../src/models/fixtures', {
  './tables': tb
});

describe('Test controllers', function () {
  this.timeout(10000);

  var Dataset = dynamoose.model(tb.datasetTableName, schemas.dataSetSchema, {create: true});
  var GranulesWWLN = dynamoose.model(tb.granulesTablePrefix + 'wwlln', schemas.granuleSchema, {create: true});
  var testDataSetRecord = 'wwlln';

  before(function (done) {
    // Create the Dynamo tables and Elasticsearch documents
    fixtures.populateDataSets(null, function (err) {
      should.not.exist(err);
      fixtures.populateGranules(err => {
        should.not.exist(err);
        done();
      });
    });
  });

  describe('Test collection controllers', function () {
    it('should list all collections', function (done) {
      collections.list({}, function (err, datasets) {
        should.not.exist(err);
        should.equal(datasets.length, 6);
        done();
      });
    });

    it('should return a particular collection', function (done) {
      collections.get({
        path: {
          short_name: testDataSetRecord
        }
      }, function (err, dataset) {
        should.not.exist(err);
        dataset.should.be.instanceOf(Object);
        should.equal(dataset.name, testDataSetRecord);
        done();
      });
    });

    it('should return nothing', function (done) {
      collections.get({
        path: {
          short_name: 'something'
        }
      }, function (err, dataset) {
        err.should.equal('Record was not found');
        done();
      });
    });

    it('should add one record', function (done) {
      wwlln.name = 'wwlln2';

      collections.post({
        body: wwlln,
        headers: {
          Token: 'thisisatesttoken'
        }
      }, function (err, dataset) {
        should.not.exist(err);
        dataset.should.equal(wwlln);
        done();
      });
    });
  });

  describe('Test granules controllers', function () {
    it('should list all datasets', function (done) {
      granules.list({
        path: {
          collection: 'wwlln'
        }
      },
      function (err, granules) {
        should.not.exist(err);
        done();
      });
    });

    it('should return error if wrong dataset name is provided', function (done) {
      granules.list({
        path: {
          collection: 'wwlln2222'
        }
      }, function (err, granules) {
        err.should.be.equal('Requested dataset (wwlln2222) doesn\'t exist');
        done();
      });
    });

    it('should return error when particular granule is not found', function (done) {
      granules.get({
        path: {
          collection: 'wwlln',
          granuleName: 'something'
        }
      }, function (err, granule) {
        err.should.be.equal('Record was not found');
        done();
      });
    });

    it('should return an array', done => {
      errors.counts({
        query: {}
      }, (err, response) => {
        should.not.exist(err);
        (Array.isArray(response)).should.be.true();
        if (response.length > 0) {
          let messageKeys = new Set(Object.keys(response[0]));
          const EXPECTED_KEYS = new Set(['dataset_id', 'count']);
          _.isEqual(messageKeys, EXPECTED_KEYS).should.be.true();
        }
        done();
      });
    });

    it('should return an array of messages', done => {
      errors.list({
        path: { dataSet: '*' },
        query: {}
      }, (err, response) => {
        should.not.exist(err);
        (Array.isArray(response)).should.be.true();
        if (response.length > 0) {
          let messageKeys = new Set(Object.keys(response[0]));
          const EXPECTED_KEYS = new Set(['timestamp', 'dataset_id', 'process', 'message']);
          _.isEqual(messageKeys, EXPECTED_KEYS).should.be.true();
        }
        done();
      });
    });
  });

  after(function (done) {
    steed.parallel([
      function (cb) {
        Dataset.$__.table.delete(function (err) {
          should.not.exist(err);
          cb(err);
        });
      }, function (cb) {
        GranulesWWLN.$__.table.delete(function (err) {
          should.not.exist(err);
          cb(err);
        });
      }, function (cb) {
        // Wipe the Elasticsearch
        esClient.indices.delete({
          index: '_all'
        }, err => cb(err));
      }
    ], function (err) {
      done(err);
    });
  });
});
