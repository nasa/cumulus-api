'use strict';
import { setEnvs, loadCredentials } from 'sulu/src/envs';

const isLocal = process.argv[2] === 'local';
const isRemote = process.argv[2] === 'remote';


export const localRun = (func) => {
  if (isLocal || isRemote) {
    process.env.IS_LOCAL = isLocal;

    // set local env variables
    setEnvs();

    // Read .env file if it exists
    loadCredentials();

    // Run the function
    func();
  }
};
