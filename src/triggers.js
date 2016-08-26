'use strict';

var _ = require('lodash');
var path = require('path');
var d = require('./queue');
var AWS = require('aws-sdk');
var dynamoose = require('dynamoose');

var models = require('./models');
var utils = require('./utils');
var tables = require('./tables');

var s3 = new AWS.S3();
var datapipeline = new AWS.DataPipeline();

/**
 * Handles processing and trigerring pending granules with AWS datapipeline
 * @param {Object} dataset a Dataset DyanmodDB record
 * @param {String} bucketName name of the AWS S3 bucket for storing pipeline paylosds
 */
var Granules = function (dataset, bucketName, cb) {
  this.dataset = dataset;
  this.pipelineGranules = [];
  this.bucketName = bucketName || 'cumulus-ghrc-logs';
  this.keyName = path.join('piplines', dataset.name, `pipeline_files_${Date.now()}.json`);
  this.s3Uri = 's3://' + path.join(this.bucketName, this.keyName);
  this.pipelineGranules = {
    datasetName: dataset.name,
    sourceDataBucket: dataset.sourceDataBucket,
    destinationDataBucket: dataset.destinationDataBucket,
    granules: []
  };
  this.granules;
  this.cb = cb;
};

Granules.prototype = {

  /**
   * Start processing the granules for a given dataset
   */
  process: function () {
    this.getGranules();
  },

  /**
   * Gets all unprocessed granules for a given dataset from DyanomoDB
   * and send them for processing by AWS datapipeline
   */
  getGranules: function () {
    var self = this;
    var Granules = dynamoose.model(
      tables.granulesTablePrefix + this.dataset.shortName.toLowerCase(),
      models.granuleSchema,
      {
        create: false,
        waitForActive: false
      }
    );

    Granules.scan('waitForPipelineSince').gt(0).exec(function (err, granules) {
      if (err) {
        return console.error(`Error scanning granules for ${self.dataset.name}`, err);
      }

      if (granules.length > 1) {
        self.processGranules(granules);
      } else {
        return self.cb('no granules to process');
      }
    });
  },

  /**
   * Create a payload for AWS Datapipeline, upload it to S3, create a new datapipline
   * add pipeline template definition to the newly created pipeline, activate it
   * and mark the records on DynamoDB
   * @param {Object} granules a list of all granules that have to be processed by datapipeline
   */
  processGranules: function (granules) {
    var self = this;
    self.granules = granules;

    if (granules) {
      console.log(`${granules.length} granules from ${self.dataset.name} are ready to be processed`);

      granules.map(function (granule) {
        console.log(`Processing ${granule.name}`);

        // get the name of each granules
        self.pipelineGranules.granules.push({
          name: granule.name,
          files: granule.sourceS3Uris
        });
      });

      console.log('Uploading list of datapipeline files to S3');
      // upload it to S3

      s3.putObject({
        Bucket: self.bucketName,
        Key: self.keyName,
        Body: JSON.stringify(self.pipelineGranules),
        ContentType: 'application/json',
        ACL: 'public-read'
      }, function (err, data) {
        if (err) {
          return console.error(`Error pushing ${self.s3Uri} to S3`, err);
        }

        self.createPipeline();
      });
    }
  },

  /**
   * Create a new AWS datapipeline
   */
  createPipeline: function () {
    var self = this;

    // create a new data pipeline
    var pipelineName = `cumulus_${self.dataset.name}_${self.pipelineGranules.granules.length}_${Date.now()}`;
    console.log(`Creating pipeline ${pipelineName}`);

    var params = {
      name: pipelineName,
      uniqueId: pipelineName,
      description: `Processing pipeline for ${self.dataset.name}`,
      tags: [
        {
          key: 'project',
          value: 'cumulus'
        }
      ]
    };

    datapipeline.createPipeline(params, function (err, pipeline) {
      if (err) {
        return console.error(`Creating pipeline ${pipelineName} failed`, err);
      }

      self.putPipelineDefinition(pipeline.pipelineId);
    });
  },

  /**
   * Adds pipeline definition to a datapipeline
   * @param {String} pipelineId an AWS Pipeline ID
   */
  putPipelineDefinition: function (pipelineId) {
    var self = this;
    var params = {
      pipelineId: pipelineId,
      pipelineObjects: utils.pipelineTemplateConverter(self.dataset.dataPipeLine.template.objects, 'fields'),
      parameterObjects: utils.pipelineTemplateConverter(self.dataset.dataPipeLine.parameters.parameters, 'attributes'),
      parameterValues: [
        {
          id: 'myS3FilesList',
          stringValue: self.s3Uri
        }
      ]
    };

    console.log(`Putting definition for  ${pipelineId}`);

    datapipeline.putPipelineDefinition(params, function (err, response) {
      if (err) {
        return console.error(`putting pipeline ${pipelineId} failed`, err);
      }

      if (!response.errored) {
        self.activatePipeline(pipelineId);
      } else {
        return console.error(`putting pipeline ${pipelineId} failed`, response.validationErrors);
      }
    });
  },

  /**
   * Activates an AWS datapipeline
   * @param {String} pipelineId an AWS Pipeline ID
   */
  activatePipeline: function (pipelineId) {
    var self = this;
    var params = {
      pipelineId: pipelineId,
      parameterValues: [
        {
          id: 'myS3FilesList',
          stringValue: self.s3Uri
        }
      ]
    };

    console.log(`Activating pipeline  ${pipelineId}`);
    datapipeline.activatePipeline(params, function (err, data) {
      if (err) {
        return console.error(`Activating pipeline ${pipelineId} failed`, err);
      }
      self.markGranulesAsSent();
    });
  },

  /**
   * Mark all granules sent to AWS datapipeline as processed
   * by removeing the waitForPipelineSince value from the record on DynamoDb
   */
  markGranulesAsSent: function () {
    var self = this;
    var Granules = dynamoose.model(
      'cumulus_granules_' + this.dataset.shortName.toLowerCase(),
      models.granuleSchema,
      {
        create: false,
        waitForActive: false
      }
    );

    console.log(`Marking granules for ${self.dataset.name} as sent`);

    var q = d.queue();

    this.granules.map(function (granule) {
      var write = function (callback) {
        Granules.update({name: granule.name}, {waitForPipelineSince: null}, function (err, response) {
          if (err) {
            console.error(`Updating granule ${granule.name} failed`, err);
          } else {
            console.log(`${granule.name} marked as sent on dynamoDB`);
          }
          callback(err);
        });
      };
      q.defer(write);
    });

    q.awaitAll(function (error) {
      self.cb(error, 'done');
    });
  }
};

/**
 * Iterate through an array of datasets and get granules for each dataset record
 * @param {Object} datasets an array of DyanmodDB records
 */
var processDatasets = function (datasets, cb) {
  datasets.map(function (dataset) {
    var g = new Granules(dataset, null, cb);
    g.process();
  });
};

/**
 * Get list of all datasets from a DynamoDB table
 * Then look for unprocessed granules in each dataset and
 * send them for processing on AWS datapipeline
 */
var trigger = function (cb) {
  // Get the model
  var Dataset = dynamoose.model(
    tables.datasetTableName,
    models.dataSetSchema,
    {create: true}
  );

  // Get the list of all datasets
  Dataset.scan().exec(function (err, datasets) {
    if (err) {
      return console.error('Error in scanning dataset table', err);
    }
    processDatasets(datasets, cb);
  });
};

module.exports = trigger;
