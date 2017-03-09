'use strict';

import AWS from 'aws-sdk';
import _ from 'lodash';
import { validate } from 'jsonschema';
import { getEndpoint } from './aws-helpers';
import {
  collection as collectionSchema,
  granule as granuleSchema,
  pdr as pdrSchema,
  provider as providerSchema
} from './schemas';

/**
 * Error class for when the record does not exist
 *
 * @param {string} message The error message
 */
export function RecordDoesNotExist(message) {
  this.name = 'RecordDoesNotExist';
  this.message = message || 'Record does not exist';
  this.stack = (new Error()).stack;
}

/**
 * The manager class handles basic operations on a given DynamoDb table
 *
 */
export class Manager {
  static recordIsValid(item, schema = null) {
    if (schema) {
      const validation = validate(item, schema);
      if (validation.errors.length) {
        throw validation.errors;
      }
    }
  }

  static async createTable(tableName, hash, range = null) {
    const dynamodb = new AWS.DynamoDB(getEndpoint());

    const params = {
      TableName: tableName,
      AttributeDefinitions: [{
        AttributeName: hash.name,
        AttributeType: hash.type
      }],
      KeySchema: [{
        AttributeName: hash.name,
        KeyType: 'HASH'
      }],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    };

    if (range) {
      params.KeySchema.push({
        AttributeName: range.name,
        KeyType: 'RANGE'
      });

      params.AttributeDefinitions.push({
        AttributeName: range.name,
        AttributeType: range.type
      });
    }

    return await dynamodb.createTable(params).promise();
  }

  static async deleteTable(tableName) {
    const dynamodb = new AWS.DynamoDB(getEndpoint());
    await dynamodb.deleteTable({
      TableName: tableName
    }).promise();
  }

  /**
   * constructor of Manager class
   *
   * @param {string} tableName the name of the table
   * @returns {object} an instance of Manager class
   */
  constructor(tableName, schema = {}) {
    this.tableName = tableName;
    this.schema = schema; // variable for the record's json schema
    this.dynamodb = new AWS.DynamoDB.DocumentClient(getEndpoint());
  }

  /**
   * Gets the item if found. If the record does not exist
   * the function throws RecordDoesNotExist error
   *
   * @param {object} item the item to search for
   * @returns {Promise} The record found
   */
  async get(item) {
    const params = {
      TableName: this.tableName,
      Key: item
    };

    const r = await this.dynamodb.get(params).promise();

    if (!r.Item) {
      throw new RecordDoesNotExist();
    }
    return r.Item;
  }

  async batchGet(items, attributes = null) {
    const params = {
      RequestItems: {
        [this.tableName]: {
          Keys: items
        }
      }
    };

    if (attributes) {
      params.RequestItems[this.tableName].AttributesToGet = attributes;
    }

    return await this.dynamodb.batchGet(params).promise();
  }

  /**
   * creates record(s)
   *
   * @param {object|array} items the Item/Items to be added to the database
   */
  async create(items) {
    const single = async (item) => {
      // add createdAt and updatedAt
      item.createdAt = item.createdAt || Date.now();
      item.updatedAt = Date.now();

      this.constructor.recordIsValid(item, this.schema);

      const params = {
        TableName: this.tableName,
        Item: item
      };

      await this.dynamodb.put(params).promise();
    };

    if (items instanceof Array) {
      for (const item of items) {
        await single(item);
      }
      return items;
    }
    await single(items);

    return items;
  }

  async scan(query) {
    const params = {
      TableName: this.tableName,
      FilterExpression: query.filter,
      ExpressionAttributeValues: query.values
    };

    if (query.names) {
      params.ExpressionAttributeNames = query.names;
    }

    return await this.dynamodb.scan(params).promise();
  }

  async delete(item) {
    const params = {
      TableName: this.tableName,
      Key: item
    };

    return await this.dynamodb.delete(params).promise();
  }

  async update(key, item, keysToDelete = []) {
    const params = {
      TableName: this.tableName,
      Key: key,
      ReturnValues: 'ALL_NEW'
    };

    // remove the keysToDelete from item if there
    item = _.omit(item, keysToDelete);
    item.updatedAt = Date.now();

    // merge key and item for validation
    // TODO: find a way to implement this
    // as of now this always fail because the updated record is partial
    //const validationObject = Object.assign({}, key, item);
    //this.constructor.recordIsValid(validationObject);

    // remove the key is not included in the item
    item = _.omit(item, Object.keys(key));

    const attributeUpdates = {};

    // build the update attributes
    Object.keys(item).forEach((k) => {
      attributeUpdates[k] = {
        Action: 'PUT',
        Value: item[k]
      };
    });

    // add keys to be removed
    keysToDelete.forEach((k) => {
      attributeUpdates[k] = { Action: 'DELETE' };
    });

    params.AttributeUpdates = attributeUpdates;

    const response = await this.dynamodb.update(params).promise();
    return response.Attributes;
  }

  /**
   * Updates the status field
   *
   */
  async updateStatus(key, status) {
    return await this.update(key, { status });
  }


  /**
   * Marks the record is failed with proper status
   * and error message
   *
   */
  async hasFailed(key, err) {
    return await this.update(
      key,
      { status: 'failed', error: err, isActive: false }
    );
  }
}

export class Provider extends Manager {
  constructor() {
    super(process.env.ProvidersTable, providerSchema);
  }

  async create(items) {
    if (items instanceof Array) {
      for (const item of items) {
        if (!item.regex) {
          item.regex = {};
        }
      }
    }
    else {
      items.regex = {};
    }
    return await super.create(items);
  }

  async addRegex(name, granuleIdExtraction, collectionName) {
    const params = {
      TableName: this.tableName,
      Key: { name: name },
      UpdateExpression: 'SET regex.#collectionName = :value',
      ExpressionAttributeNames: {
        '#collectionName': collectionName
      },
      ExpressionAttributeValues: {
        ':value': granuleIdExtraction
      },
      ReturnValues: 'ALL_NEW'
    };

    const response = await this.dynamodb.update(params).promise();
    return response.Attributes;
  }

  async removeRegex(name, collectionName) {
    const params = {
      TableName: this.tableName,
      Key: { name: name },
      UpdateExpression: 'REMOVE regex.#collectionName',
      ExpressionAttributeNames: {
        '#collectionName': collectionName
      },
      ReturnValues: 'ALL_NEW'
    };

    const response = await this.dynamodb.update(params).promise();
    return response.Attributes;
  }

  /**
   * Sets the PDR record to active and updates status to ingesting
   *
   */
  async restart(name) {
    return await this.update(
      { name: name },
      { status: 'ingesting', isActive: true },
      ['error'] // keys to delete
    );
  }
}

export class Collection extends Manager {
  constructor() {
    super(process.env.CollectionsTable, collectionSchema);
  }

  async create(items) {
    items = await super.create(items);

    async function addRegex(item) {
      if (item.providers) {
        const p = new Provider();
        for (const provider of item.providers) {
          try {
            // if the update didn't happen gracefully ignore
            await p.addRegex(
              provider,
              item.granuleDefinition.granuleIdExtraction,
              item.collectionName
            );
          }
          catch (e) {
            console.error(e);
          }
        }
      }
    }

    // add file definitions to the
    if (items instanceof Array) {
      for (const item of items) {
        await addRegex(item);
      }
      return items;
    }

    await addRegex(items);
    return items;
  }


  async delete(item) {
    const collection = await this.get({ collectionName: item.collectionName });
    const response = await super.delete(item);

    // remove the collectionName from the provider table
    const p = new Provider();
    if (collection.providers) {
      for (const provider of collection.providers) {
        try {
          await p.removeRegex(provider, item.collectionName);
        }
        catch (e) {
          console.error(e);
        }
      }
    }
    return response;
  }
}

export class User extends Manager {
  constructor() {
    super(process.env.UsersTable);
  }
}

export class Distribution extends Manager {
  constructor() {
    super(process.env.DistributionTable);
  }
}

export class Errors extends Manager {
  constructor() {
    super(process.env.ErrorsTable);
  }

  static buildRecord(objName, msg, funcName) {
    return {
      objName: objName,
      msg: msg,
      funcName,
      createdAt: Date.now()
    };
  }
}

export class Pdr extends Manager {
  constructor() {
    super(process.env.PDRsTable, pdrSchema);
  }

  static buildRecord(pdrName, provider, originalUrl) {
    return {
      pdrName: pdrName,
      provider: provider,
      originalUrl: originalUrl,
      status: 'discovered',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      discoveredAt: Date.now()
    };
  }

  async addGranule(pdrName, granuleId, processed = false) {
    const params = {
      TableName: this.tableName,
      Key: { pdrName: pdrName },
      UpdateExpression: 'SET granules.#granuleId = :value',
      ExpressionAttributeNames: {
        '#granuleId': granuleId
      },
      ExpressionAttributeValues: {
        ':value': processed
      },
      ReturnValues: 'ALL_NEW'
    };

    const response = await this.dynamodb.update(params).promise();

    return response.Attributes;
  }
}

export class Granule extends Manager {
  constructor() {
    // initiate the manager class with the name of the
    // granules table
    super(process.env.GranulesTable, granuleSchema);
  }

  static getGranuleId(fileName, regex) {
    const test = new RegExp(regex);
    const match = fileName.match(test);

    if (match) {
      return match[1];
    }
    return match;
  }

  /**
   * This static method generates the first stage of a granule record
   * The first stage is when the granule is created by the original files
   * ingested from a source
   * @param {string} collectionName the name of the granule's collection
   * @param {string} granuleId the granule ID
   * @param {array} files an array of ingested files
   */
  static async buildRecord(collectionName, pdrName, granuleId, files, collectionObj = null) {
    const granuleRecord = {
      granuleId,
      collectionName,
      pdrName
    };

    // get the collection
    let collectionRecord;
    if (collectionObj) {
      collectionRecord = collectionObj;
    }
    else {
      const c = new Collection();
      collectionRecord = await c.get({ collectionName: collectionName });
    }

    // check the granuleId is valid
    const granuleIdTest = new RegExp(collectionRecord.granuleDefinition.granuleId);
    if (!granuleId.match(granuleIdTest)) {
      throw new Error(
        `Invalid Granule ID. It does not match the granule ID definition
        The invalid granuleId is ${granuleId}
        The expected granuleId should be ${collectionRecord.granuleDefinition.granuleId}`
      );
    }

    // add recipe to the record
    granuleRecord.recipe = collectionRecord.recipe;

    // add cmrProvider
    granuleRecord.cmrProvider = collectionRecord.cmrProvider;

    // add file definitions to the granule
    granuleRecord.files = collectionRecord.granuleDefinition.files;
    Object.keys(granuleRecord.files).forEach((key) => {
      const file = granuleRecord.files[key];

      // add default fields
      file.sipFile = null;
      file.stagingFile = null;
      file.archivedFile = null;
      file.name = null;

      const test = new RegExp(file.regex);

      files.forEach((element) => {
        const name = element.filename;

        if (name.match(test)) {
          file.name = name;
          file.sipFile = element.url;
        }
      });

      // add updated file back to the granule record
      granuleRecord.files[key] = file;
    });

    // add dates
    granuleRecord.createdAt = Date.now();
    granuleRecord.updatedAt = Date.now();
    granuleRecord.status = 'ingesting';
    granuleRecord.ingestStartedAt = Date.now();

    return granuleRecord;
  }

  async ingestCompleted(key, files) {
    const record = await this.get(key);

    const updatedRecord = {};
    const recordFiles = record.files;

    for (const file of files) {
      for (const fileDefintion of Object.entries(recordFiles)) {
        // get fileName from uri and regex from file definition
        const test = new RegExp(fileDefintion[1].regex);

        // if file belong to the fileDefinition group
        if (file.name.match(test)) {
          const s3Uri = `s3://${file.bucket}/${file.type}/${file.name}`;
          recordFiles[fileDefintion[0]].sipFile = file.file;
          recordFiles[fileDefintion[0]].stagingFile = s3Uri;
        }
      }
    }

    updatedRecord.files = recordFiles;
    updatedRecord.updatedAt = Date.now();
    updatedRecord.ingestEndedAt = Date.now();

    const duration = (
      updatedRecord.ingestEndedAt -
      updatedRecord.ingestStartedAt
    );

    updatedRecord.ingestDuration = duration ? duration / 1000 : 0;
    updatedRecord.status = 'processing';

    return await this.update(key, updatedRecord);
  }


  /**
   * Adds current time for various reasons to the granule record
   * For example granulePushedToCmr or processingCompleted or processingFailed
   */
  async addTime(key, fieldName) {
    const values = {};
    values[fieldName] = Date.now();
    return await this.update(key, values);
  }

  /**
   * Adds a file uri to the granule
   *
   */
  async addFile(key, fileName, type, uri) {
    const params = {
      TableName: this.tableName,
      Key: key,
      UpdateExpression: 'SET granuleRecord.files.#fileName.#location = :value',
      ExpressionAttributeNames: {
        '#fileName': fileName,
        '#location': type
      },
      ExpressionAttributeValues: {
        ':value': uri
      },
      ReturnValues: 'ALL_NEW'
    };

    const response = await this.dynamodb.update(params).promise();

    return response.Attributes;
  }

  /**
   * Updates the processing duration of the granule
   *
   */
  async updateDuration(key, duration) {
    return await this.update(key, { duration: parseFloat(duration) });
  }

  /**
   * Updates the PDR record with the granule info
   *
   */
  async updatePdr(key) {
    const g = await this.get(key);
    const p = new Pdr();

    return await p.addGranule(g.pdrName, key.granuleId, true);
  }
}
