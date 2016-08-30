'use strict';

var dynamoose = require('dynamoose');
var models = require('./models');
var tb = require('./tables');

console.log('Creating Dataset table');
dynamoose.model(tb.datasetTableName, models.dataSetSchema, {create: true});

console.log('Creating Granules Table for WWLLN');
dynamoose.model(tb.granulesTablePrefix + 'wwlln', models.granuleSchema, {create: true});

console.log('Creating datapipeline Table');
dynamoose.model(tb.datapipelineTableName, models.dataPipeLineSchema, {create: true});

// Migrations such as updating the throughput or adding new global indexes should go here
//
//
