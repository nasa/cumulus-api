'use strict';
import { envs } from 'sulu';

const isLocal = process.argv[2] === 'local';
const isRemote = process.argv[2] === 'remote';


export const localRun = (func) => {
  if (isLocal || isRemote) {
    process.env.IS_LOCAL = isLocal;

    // set local env variables
    envs.setEnvs();

    // Read .env file if it exists
    envs.loadCredentials();

    // Run the function
    func();
  }
};
