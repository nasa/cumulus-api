'use strict';

var AWS = require('aws-sdk');
var dynamoose = require('dynamoose');

var models = require('./models');
var utils = require('./utils');
var wwlln = require('./wwlln.json');
var parameters = require('./parameters.json');
var tables = require('./tables');

var s3 = new AWS.S3();
var datapipeline = new AWS.DataPipeline();

/**
 * Handles processing and trigerring pending granules with AWS datapipeline
 * @param {Object} dataset a Dataset DyanmodDB record
 * @param {String} bucketName name of the AWS S3 bucket for storing pipeline paylosds
 */
var Granules = function (dataset, bucketName) {
  this.dataset = dataset;
  this.pipelineGranules = [];
  this.bucketName = bucketName || 'cumulus-source';
  this.keyName = `pipeline-files/${dataset.name}/pipeline_files_${Date.now()}.json`;
  this.s3UriBase = `s3://${this.bucketName}/`;
  this.s3Uri = `${this.s3UriBase}/${this.keyName}`;
  this.pipelineGranules = [];
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
      'granules_' + this.dataset.shortName.toLowerCase(),
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

      // console.log(granules);
      self.processGranules(granules);
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

    if (granules) {
      console.log(`${granules.length} granules from ${self.dataset.name} are ready to be processed`);

      granules.map(function (granule) {
        console.log(`Processing ${granule.name}`);

        // get the name of each granules
        self.pipelineGranules.push({
          name: granule.name,
          files: granule.sourceS3Uris
        });
      });

      console.log('Uploading list of datapipeline files to S3');
      // upload it to S3

      s3.putObject({
        Bucket: self.bucketName,
        Key: self.keyName,
        Body: JSON.stringify(self.pipelineGranules)
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
    var pipelineName = `cumulus_${self.dataset.name}_${self.pipelineGranules.length}_${Date.now()}`;
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
      pipelineObjects: utils.pipelineTemplateConverter(wwlln.objects, 'fields'),
      parameterObjects: utils.pipelineTemplateConverter(parameters.parameters, 'attributes'),
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

      console.log('logging to markGranulesAsSent');
    });
  },

  /**
   * Mark all granules sent to AWS datapipeline as processed
   * by removeing the waitForPipelineSince value from the record on DynamoDb
   */
  markGranulesAsSent: function () {

  }
};

/**
 * Iterate through an array of datasets and get granules for each dataset record
 * @param {Object} datasets an array of DyanmodDB records
 */
var processDatasets = function (datasets) {
  datasets.map(function (dataset) {
    var g = new Granules(dataset);
    g.process();
  });
};

/**
 * Get list of all datasets from a DynamoDB table
 * Then look for unprocessed granules in each dataset and
 * send them for processing on AWS datapipeline
 */
var trigger = function () {
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
    processDatasets(datasets);
  });
};

trigger();
