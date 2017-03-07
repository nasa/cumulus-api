'use strict';

const envs = require('./src/envs');

const isLocal = process.argv[2] === 'local';

process.env.IS_LOCAL = isLocal;

if (isLocal) {
  process.env.MODE = 'local';
}
else {
  process.env.MODE = 'remote';
}

// set local env variables
envs.setEnvs();

// Read .env file if it exists
envs.loadCredentials();

module.exports.common = require('./src/common');
module.exports.cf = require('./src/cf');
module.exports.lambda = require('./src/lambda');
module.exports.offline = require('./src/offline');
module.exports.dynamo = require('./src/dynamo');
module.exports.envs = require('./src/envs');
module.exports.bootstrap = require('./src/bootstrap');
module.exports.users = require('./src/users');
