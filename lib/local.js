'use strict';
import { load } from 'dotenv';
import path from 'path';
import { setEnvs } from 'sulu';

const isLocal = process.argv[2] === 'local';

export function loadCredentials() {
  load({
    path: path.resolve(__dirname, '../../.env')
  });

  load({
    path: path.resolve(__dirname, '../.env')
  });
}

export const localRun = (func) => {
  if (isLocal) {
    process.env.IS_LOCAL = false;

    // set local env variables
    setEnvs();

    // Read .env file if it exists
    loadCredentials();

    // Run the function
    func();
  }
};
