// To copy records from one table to another run:
// ./node_modules/.bin/dynamodb-migrate scan us-east-1/granuleTableBackup ./lib/db_operations.js --live
//
// To Delete records from a table, change the module.exports at the bottom of this file
// and then run the same command.
// More info: https://github.com/mapbox/dynamodb-migrator


const AWS = require('aws-sdk');
let counter = 0;

process.env.AWS_DEFAULT_REGION = 'us-east-1';
process.env.AWS_REGION = 'us-east-1';

const dynamo = new AWS.DynamoDB.DocumentClient();
const attr = require('dynamodb-data-types').AttributeValue;

function addGranules(record, dyno, callback) {
  if (!dyno) return callback();

  const params = {
    TableName: 'cumulus-api-test2-dev-GranulesTable',
    Item: record
  };

  dynamo.put(params, (err) => {
    counter++;
    console.log(`${counter}: ${record.granuleId} copied!`);
    callback(err);
  });
}

function updateGranules(record, dyno, callback) {
  if (!dyno) return callback();

  record.statusId = 4;

  const params = {
    TableName: 'cumulus-api-test2-dev-GranulesTable',
    Item: record
  };
  console.log(params);

  dyno.putItem(params, (err) => {
    counter++;
    console.log(`${counter}: ${record.granuleId} updated!`);
    callback(err);
  });
}

function deleteGranules(record, dyno, callback) {
  // If you are running a dry-run, `dyno` will be null
  if (!dyno) return callback();

  dyno.deleteItem({ Key: { granuleId: record.granuleId } }, (err) => {
    if (err) {
      console.error('%s failed to delete', record.id);
    }
    counter++;
    console.log(`${counter}: deleted!`);
    callback();
  });
}

module.exports.finish = function(dyno, callback) {
  console.log('%s records processed', counter);
  callback();
};

module.exports = updateGranules;
