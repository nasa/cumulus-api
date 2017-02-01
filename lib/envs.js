/**
 * Makes the environment variables defined in config.js
 * available locally
 */
'use strict';

import { parseConfig } from './aws/common';

export function setEnvs() {
  const config = parseConfig();

  for (const key of Object.keys(config.envs)) {
    process.env[key] = config.envs[key];
  }
}

if (require.main === module) {
  setEnvs();
  console.log(process.env.StackName);
}
