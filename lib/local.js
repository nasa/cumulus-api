'use strict';
import { load } from 'dotenv';
import path from 'path';

const isLocal = process.argv[2] === 'local';

export const localRun = (func) => {
  if (isLocal) {
    func();
  }
};

export const loadCredentials = () => {
  load({
    path: path.resolve(__dirname, '../../.env')
  });
};
