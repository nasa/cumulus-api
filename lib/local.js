'use strict';
import { load } from 'dotenv';
import path from 'path';
import { setEnvs } from './envs';

const isLocal = process.argv[2] === 'local';

export const loadCredentials = () => {
  return load({
    path: path.resolve(__dirname, '../.env')
  });
};

export const localRun = (func) => {
  if (isLocal) {
    // set local env variables
    setEnvs();

    // Read .env file if it exists
    loadCredentials();

    // Run the function
    func();
  }
};
