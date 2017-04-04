/**
 * Makes the environment variables defined in config.js
 * available locally
 */

'use strict';

const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');
const common = require('./common');

module.exports.loadCredentials = function loadCredentials() {
  const envConfig = dotenv.parse(fs.readFileSync(path.join(process.cwd(), '.env')));
  Object.keys(envConfig).forEach((k) => {
    process.env[k] = envConfig[k];
  });
};


module.exports.setEnvs = function setEnvs(stage) {
  const config = common.parseConfig(null, null, stage);

  Object.keys(config.envs).forEach((key) => {
    process.env[key] = config.envs[key];
  });
};


module.exports.apply = function apply(stage) {
  const isLocal = process.argv[2] === 'local';

  process.env.IS_LOCAL = isLocal;

  if (isLocal) {
    process.env.MODE = 'local';
  }
  else {
    process.env.MODE = 'remote';
  }

  //set local env variables
  module.exports.setEnvs(stage);

  //Read .env file if it exists
  module.exports.loadCredentials();
};
