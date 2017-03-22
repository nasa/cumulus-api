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


module.exports.setEnvs = function setEnvs() {
  const config = common.parseConfig();

  Object.keys(config.envs).forEach((key) => {
    process.env[key] = config.envs[key];
  });
};
