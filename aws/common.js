'use strict';

const yaml = require('js-yaml');
const fs = require('fs-extra');
const execSync = require('child_process').execSync;

/**
 * Executes shell commands synchronously and logs the
 * stdout to console.
 * @param  {String} cmd  Bash command
 * @return {String}     The command's stdout
 */
function exec(cmd) {
  const stdout = execSync(cmd);
  console.log(stdout.toString());
  return stdout;
}

/**
 * Parses the config/config.yml to js Object
 * @return {Object}
 */
function parseConfig() {
  return yaml.safeLoad(fs.readFileSync('config/config.yml', 'utf8'));
}

module.exports.parseConfig = parseConfig;
module.exports.exec = exec;
