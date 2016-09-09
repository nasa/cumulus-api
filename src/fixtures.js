'use strict';

var dynamoose = require('dynamoose');
var tables = require('./tables');
var models = require('./models');
var avaps = require('./pipeline/avaps');
var wwlln = require('./pipeline/wwlln');

var populateDataSets = function (record) {
  var Dataset = dynamoose.model(
    tables.datasetTableName,
    models.dataSetSchema,
    {create: true}
  );

  var newRecord = new Dataset(record);
  newRecord.save(function (err) {
    if (err) {
      return console.error('There is an error saving the record', err);
    }

    console.log(`${record.name} saved!`);
  });
};

populateDataSets(wwlln);
populateDataSets(avaps);
