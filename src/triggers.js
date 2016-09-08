'use strict';

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
var Granules = function (dataset, granules, pipelineGranules) {
  this.dataset = dataset;
  this.pipelineGranules = pipelineGranules;
  this.bucketName = 'cumulus-ghrc-logs';
  this.keyName = path.join('piplines', dataset.name, `pipeline_files_${Date.now()}.json`);
  this.s3Uri = 's3://' + path.join(this.bucketName, this.keyName);
  this.granules = granules;
  this.cb;
  this.pipelineId;
  this.piplineName;
};

Granules.prototype = {

  /**
   * Start processing the granules for a given dataset
   */
  process: function (cb) {
    this.cb = cb;
    this.processGranules();
  },

  /**
   * Create a payload for AWS Datapipeline, upload it to S3, create a new datapipline
   * add pipeline template definition to the newly created pipeline, activate it
   * and mark the records on DynamoDB
   * @param {Object} granules a list of all granules that have to be processed by datapipeline
   */
  processGranules: function () {
    var self = this;

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
  },

  /**
   * Create a new AWS datapipeline
   */
  createPipeline: function () {
    var self = this;

    // create a new data pipeline
    this.pipelineName = `cumulus_${self.dataset.name}_${self.granules.length}_${Date.now()}`;
    console.log(`Creating pipeline ${self.pipelineName}`);

    var params = {
      name: self.pipelineName,
      uniqueId: self.pipelineName,
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
        console.error(`Creating pipeline ${self.pipelineName} failed`, err);
        return this.cb(err);
      }

      self.pipelineId = pipeline.pipelineId;
      self.putPipelineDefinition();
    });
  },

  /**
   * Adds pipeline definition to a datapipeline
   * @param {String} pipelineId an AWS Pipeline ID
   */
  putPipelineDefinition: function () {
    var self = this;
    var params = {
      pipelineId: self.pipelineId,
      pipelineObjects: utils.pipelineTemplateConverter(self.dataset.dataPipeLine.template.objects, 'fields'),
      parameterObjects: utils.pipelineTemplateConverter(self.dataset.dataPipeLine.parameters.parameters, 'attributes'),
      parameterValues: [
        {
          id: 'myS3FilesList',
          stringValue: self.s3Uri
        }
      ]
    };

    console.log(`Putting definition for  ${self.pipelineId}`);

    datapipeline.putPipelineDefinition(params, function (err, response) {
      if (err) {
        console.error(`putting pipeline ${self.pipelineId} failed`, err);
        return this.cb(err);
      }

      if (!response.errored) {
        self.addPipelineToDynamoDB();
      } else {
        return console.error(`putting pipeline ${self.pipelineId} failed`, response.validationErrors);
      }
    });
  },

  addPipelineToDynamoDB: function () {
    var self = this;

    var PipelineModel = dynamoose.model(
      tables.datapipelineTableName,
      models.dataPipeLineSchema,
      {
        create: true,
        waitForActive: true
      }
    );

    var newPipeline = new PipelineModel({
      pipelineId: self.pipelineId,
      pipelineName: self.pipelineName,
      dataset: self.dataset.name,
      granules: self.s3Uri,
      timeStarted: Date.now()
    });

    newPipeline.save(function (err) {
      if (err) {
        return self.cb(err);
      }

      self.activatePipeline();
    });
  },

  /**
   * Activates an AWS datapipeline
   * @param {String} pipelineId an AWS Pipeline ID
   */
  activatePipeline: function () {
    var self = this;
    var params = {
      pipelineId: self.pipelineId,
      parameterValues: [
        {
          id: 'myS3FilesList',
          stringValue: self.s3Uri
        }
      ]
    };

    console.log(`Activating pipeline  ${self.pipelineId}`);
    datapipeline.activatePipeline(params, function (err, data) {
      if (err) {
        console.error(`Activating pipeline ${self.pipelineId} failed`, err);
        this.cb(err);
      } else {
        return self.markGranulesAsSent();
      }
    });
  },

  /**
   * Mark all granules sent to AWS datapipeline as processed
   * by removeing the waitForPipelineSince value from the record on DynamoDb
   */
  markGranulesAsSent: function () {
    var self = this;
    var GranulesModel = dynamoose.model(
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
        GranulesModel.update({name: granule.name}, {waitForPipelineSince: null}, function (err, response) {
          if (err) {
            console.error(`Updating granule ${granule.name} failed`, err);
          } else {
            // console.log(`${granule.name} marked as sent on dynamoDB`);
          }
          callback(err);
        });
      };
      q.defer(write);
    });

    q.awaitAll(function (error) {
      self.cb(error, {
        pipelineId: self.pipelineId
      });
    });
  }
};

var batching = function (dataset, cb) {
  var GranulesModel = dynamoose.model(
    tables.granulesTablePrefix + dataset.shortName.toLowerCase(),
    models.granuleSchema,
    {
      create: false,
      waitForActive: false
    }
  );

  // GranulesModel.scan('waitForPipelineSince').gt(0).exec(function (err, granules) {
  GranulesModel.scan().exec(function (err, granules) {
    if (err) {
      return console.error(`Error scanning granules for ${dataset.name}`, err);
    }

    if (granules.length > 0) {
      var pipelineGranules = {
        datasetName: dataset.name,
        sourceDataBucket: dataset.sourceDataBucket,
        destinationDataBucket: dataset.destinationDataBucket,
        granules: []
      };

      var granulesList = [];
      var q = d.queue();

      granules.map(function (granule) {
        // console.log(`Processing ${granule.name}`);

        // get the name of each granules
        pipelineGranules.granules.push({
          name: granule.name,
          files: granule.sourceS3Uris
        });

        granulesList.push(granule);

        if (granulesList.length > dataset.dataPipeLine.batchLimit - 1) {
          q.defer(function (callback) {
            var g = new Granules(
              dataset,
              granulesList.slice(),
              Object.assign({}, pipelineGranules)
            );
            g.process(callback);
          });

          granulesList = [];
          pipelineGranules.granules = [];
        }
      });

      // send the remaining granules to a separate pipeline
      if (granulesList.length > 0) {
        q.defer(function (callback) {
          var g = new Granules(
            dataset,
            granulesList,
            Object.assign({}, pipelineGranules)
          );
          g.process(callback);
        });
      }

      q.awaitAll(function (error, pipelineIds) {
        cb(error, {
          pipelineIds: pipelineIds
        });
      });
    } else {
      return cb('no granules to process');
    }
  });
};

/**
 * Iterate through an array of datasets and get granules for each dataset record
 * @param {Object} datasets an array of DyanmodDB records
 */
var processDatasets = function (datasets, cb) {
  datasets.map(function (dataset) {
    batching(dataset, cb);
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

// trigger(function (err, results) {
//   console.log(err);
//   console.log(results);
// });
