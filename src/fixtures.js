'use strict';

var dynamoose = require('dynamoose');
var tables = require('./tables');
var models = require('./models');
var wwlln = require('./pipeline/wwlln');

var populateDataSets = function () {
  var Dataset = dynamoose.model(
    tables.datasetTableName,
    models.dataSetSchema,
    {create: true}
  );

  var newRecord = new Dataset(wwlln);
  newRecord.save();
};

populateDataSets();
