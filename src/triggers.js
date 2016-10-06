'use strict';

var _ = require('lodash');
var path = require('path');
var AWS = require('aws-sdk');
var steed = require('steed')();
var dynamoose = require('dynamoose');

var schemas = require('./models/schemas');
var utils = require('./utils');
var tables = require('./models/tables');

var s3 = new AWS.S3();
var datapipeline = new AWS.DataPipeline();

/**
 * Handles processing and trigerring pending granules with AWS datapipeline
 * @param {Object} dataset a Dataset DyanmodDB record
 * @param {String} bucketName name of the AWS S3 bucket for storing pipeline paylosds
 */
var Granules = function (dataset, pipelineGranules) {
  this.dataset = dataset;
  this.pipelineGranules = pipelineGranules;
  this.bucketName = 'cumulus-ghrc-logs';
  this.keyName = path.join('piplines', dataset.name, `pipeline_files_${Date.now()}.json`);
  this.s3Uri = 's3://' + path.join(this.bucketName, this.keyName);
  this.granules = pipelineGranules.granules;
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
        return self.cb(err);
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
      parameterObjects: utils.pipelineTemplateConverter(self.dataset.dataPipeLine.parameters.parameters, 'attributes')
    };

    console.log(`Putting definition for  ${self.pipelineId}`);

    datapipeline.putPipelineDefinition(params, function (err, response) {
      if (err) {
        console.error(`putting pipeline ${self.pipelineId} failed`, err);
        return self.cb(err);
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
      schemas.dataPipeLineSchema,
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
          stringValue: this.keyName
        },
        {
          id: 'mySplunkHost',
          stringValue: process.env.mySplunkHost
        },
        {
          id: 'mySplunkUsername',
          stringValue: process.env.mySplunkUsername
        },
        {
          id: 'mySplunkPassword',
          stringValue: process.env.mySplunkPassword
        },
        {
          id: 'myShortName',
          stringValue: self.dataset.shortName
        },
        {
          id: 'myCmrPassword',
          stringValue: process.env.myCmrPassword
        }
      ]
    };

    console.log(`Activating pipeline  ${self.pipelineId}`);
    datapipeline.activatePipeline(params, function (err, data) {
      if (err) {
        console.error(`Activating pipeline ${self.pipelineId} failed`, err);
        self.cb(err);
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
      'cumulus_granules_' + this.dataset.name.toLowerCase(),
      schemas.granuleSchema,
      {
        create: false,
        waitForActive: false
      }
    );

    console.log(`Marking granules for ${self.dataset.name} as sent`);

    steed.map(this.granules, function (granule, callback) {
      GranulesModel.update({name: granule.name}, {waitForPipelineSince: null}, function (err, response) {
        if (err) {
          console.error(`Updating granule ${granule.name} failed`, err);
        } else {
          // console.log(`${granule.name} marked as sent on dynamoDB`);
        }
        callback(err);
      });
    }, function (err) {
      self.cb(err, {
        pipelineId: self.pipelineId
      });
    });
  }
};

var generatePayload = function (dataset, granules) {
  var batchs = [];

  var pipelineGranules = {
    datasetName: dataset.name,
    sourceDataBucket: dataset.sourceDataBucket,
    destinationDataBucket: dataset.destinationDataBucket,
    granules: []
  };

  var granulesList = [];

  granules.map(function (granule) {
    // get the name of each granules
    pipelineGranules.granules.push({
      name: granule.name,
      sourceS3Uris: granule.sourceS3Uris,
      destinationS3Uris: granule.destinationS3Uris
    });

    granulesList.push(granule);

    if (granulesList.length > dataset.dataPipeLine.batchLimit - 1) {
      batchs.push(Object.assign({}, pipelineGranules));
      granulesList = [];
      pipelineGranules.granules = [];
    }
  });

  if (granulesList.length > 0) {
    batchs.push(Object.assign({}, pipelineGranules));
  }

  return batchs;
};

var batching = function (dataset, callback) {
  var GranulesModel = dynamoose.model(
    tables.granulesTablePrefix + dataset.name.toLowerCase(),
    schemas.granuleSchema,
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
      var payloads = generatePayload(dataset, granules);

      steed.map(payloads, function (payload, cb) {
        var g = new Granules(
          dataset,
          payload
        );
        g.process(cb);
      }, function (err, pipelineIds) {
        callback(err, {
          pipelineIds: pipelineIds
        });
      });
    } else {
      return callback('no granules to process');
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
var trigger = function (dataset, cb) {
  // Get the model
  var Dataset = dynamoose.model(
    tables.datasetTableName,
    schemas.dataSetSchema,
    {create: true}
  );

  var search = {};

  if (dataset) {
    search.name = {
      eq: dataset
    };
  }

  // Get the list of all datasets
  Dataset.scan(search).exec(function (err, datasets) {
    if (err) {
      return cb(err);
    }

    if (_.has(datasets[0], 'name')) {
      processDatasets(datasets, cb);
    } else {
      cb(`Dataset ${dataset} was not found`);
    }
    //
  });
};

module.exports.trigger = trigger;
module.exports.generatePayload = generatePayload;
