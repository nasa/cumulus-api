'use strict';

import { Manager, RecordDoesNotExist, ValidationError } from './base';
import { Collection } from './collections';
import { Granule } from './granules';
import { Pdr } from './pdrs';
import { Provider } from './providers';

export class User extends Manager {
  constructor() {
    super(process.env.UsersTable);
  }
}

export class Resource extends Manager {
  constructor() {
    super(process.env.ResourcesTable);
  }
}

export class Distribution extends Manager {
  constructor() {
    super(process.env.DistributionTable);
  }
}

export class Pan extends Manager {
  constructor() {
    super(process.env.PANsTable);
  }

  static buildRecord(pdrName, pdrId, type, message) {
    return {
      pdrName,
      pdrId,
      type,
      message,
      createdAt: Date.now()
    };
  }
}


export {
  Collection,
  Granule,
  Pdr,
  Provider,
  Manager,
  RecordDoesNotExist,
  ValidationError
};
