/**
 * Makes the environment variables defined in config.js
 * available locally
 */
'use strict';

const dotenv = require('dotenv');
const path = require('path');
const common = require('./common');

module.exports.loadCredentials = function loadCredentials() {
  dotenv.load({
    path: path.join(process.cwd(), '.env')
  });
};


module.exports.setEnvs = function setEnvs() {
  const config = common.parseConfig();

  Object.keys(config.envs).forEach((key) => {
    process.env[key] = config.envs[key];
  });
};
