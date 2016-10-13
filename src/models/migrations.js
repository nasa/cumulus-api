'use strict';

var dynamoose = require('dynamoose');
var schemas = require('./schemas');
var tb = require('./tables');

console.log('Creating Dataset table');
dynamoose.model(tb.datasetTableName, schemas.dataSetSchema, {create: true});

console.log('Creating Granules Table for WWLLN');
dynamoose.model(tb.granulesTablePrefix + 'wwlln', schemas.granuleSchema, {create: true});

console.log('Creating datapipeline Table');
dynamoose.model(tb.datapipelineTableName, schemas.dataPipeLineSchema, {create: true});

// Migrations such as updating the throughput or adding new global indexes should go here
//
//
