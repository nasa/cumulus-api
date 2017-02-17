'use strict';
import { load } from 'dotenv';
import path from 'path';
import { setEnvs } from './envs';

const isLocal = process.argv[2] === 'local';
const isRemote = process.argv[2] === 'remote';

export function loadCredentials() {
  load({
    path: path.resolve(__dirname, '../../../.env')
  });

  load({
    path: path.resolve(__dirname, '../../.env')
  });

  load({
    path: path.resolve(__dirname, '../.env')
  });
}

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
