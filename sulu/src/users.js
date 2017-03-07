'use strict';

//const getEndpoint = require('cumulus-common/aws-helpers').getEndpoint;
const AWS = require('aws-sdk');
const forge = require('node-forge');

function getEndpoint(local, port) {
  const args = {};
  local = local || false;
  port = port || 8000;

  if (process.env.IS_LOCAL === 'true' || local) {
    // use dummy access info
    AWS.config.update({
      accessKeyId: 'myKeyId',
      secretAccessKey: 'secretKey',
      region: 'us-east-1'
    });
    args.endpoint = new AWS.Endpoint(`http://localhost:${port}`);
    return args;
  }

  if (process.env.AWS_DEFAULT_REGION) {
    AWS.config.update({ region: process.env.AWS_DEFAULT_REGION });
  }

  return args;
}

function dynamo(local) {
  return new AWS.DynamoDB.DocumentClient(getEndpoint(local));
}

function add(username, password, options) {
  const dynamodb = dynamo(options.local);

  const md = forge.md.md5.create();
  md.update(password);

  const item = {
    userName: username,
    password: md.digest().toHex(),
    createAt: Date.now()
  };

  const params = {
    TableName: process.env.UsersTable,
    Item: item
  };

  dynamodb.put(params, (e, r) => {
    if (e) return console.log(e);
    console.log(r);
    console.log('Username, password created');
  });
}


function list(options) {
  const dynamodb = dynamo(options.local);

  dynamodb.scan({ TableName: process.env.UsersTable }, (e, r) => {
    if (e) return console.log(e);
    console.log(r);
  });
}

function deleteUser(username, options) {
  const dynamodb = dynamo(options.local);
  const params = {
    TableName: process.env.UsersTable,
    Key: {
      userName: username
    }
  };

  dynamodb.delete(params, (e, r) => {
    if (e) return console.log(e);

    console.log(r);
  });
}

module.exports.add = add;
module.exports.list = list;
module.exports.delete = deleteUser;
