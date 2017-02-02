'use strict';

const isLocal = process.argv[2] === 'local';

export const localRun = (func) => {
  if (isLocal) {
    func();
  }
};
