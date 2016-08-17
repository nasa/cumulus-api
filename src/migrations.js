'use strict';

var dynamoose = require('dynamoose');
var models = require('./models');

console.log('Creating Dataset table');
dynamoose.model('datasets', models.dataSetSchema, {create: true});


console.log('Creating Granules Table for WWLLN');
dynamoose.model('granules_wwlln', models.granuleSchema, {create: true});

// Migrations such as updating the throughput or adding new global indexes should go here
//
//
