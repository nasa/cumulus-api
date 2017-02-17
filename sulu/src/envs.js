/**
 * Makes the environment variables defined in config.js
 * available locally
 */
'use strict';

const common = require('./common');

module.exports = function setEnvs() {
  const config = common.parseConfig();

  Object.keys(config.envs).forEach((key) => {
    process.env[key] = config.envs[key];
  });
};
