'use strict';

import AWS from 'aws-sdk';
import pvl from 'pvl';
import _ from 'lodash';
import Ajv from 'ajv';
import { getEndpoint } from './aws-helpers';
import { PDRParsingError } from './pdr';
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

export class ValidationError {
  constructor(message) {
    this.name = 'Validation Error';
    this.message = message || 'There was a validation';
    this.stack = (new Error()).stack;
  }
}

/**
 * The manager class handles basic operations on a given DynamoDb table
 *
 */
export class Manager {
  static recordIsValid(item, schema = null, removeAdditional = false) {
    if (schema) {
      const ajv = new Ajv({
        useDefaults: true,
        v5: true,
        removeAdditional: removeAdditional
      });
      const validate = ajv.compile(schema);
      const valid = validate(item);
      if (!valid) {
        throw validate.errors;
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

    return dynamodb.createTable(params).promise();
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
    this.removeAdditional = false;
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

    return this.dynamodb.batchGet(params).promise();
  }

  async batchWrite(deletes, puts) {
    deletes = deletes ? deletes.map(d => ({ DeleteRequest: { Key: d } })) : [];
    puts = puts ? puts.map((d) => {
      d.updatedAt = Date.now();
      return { PutRequest: { Item: d } };
    }) : [];

    const items = deletes.concat(puts);

    if (items.length > 25) {
      throw new Error('Batch Write supports 25 or fewer bulk actions at the same time');
    }

    const params = {
      RequestItems: {
        [this.tableName]: items
      }
    };

    return this.dynamodb.batchWrite(params).promise();
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

      this.constructor.recordIsValid(item, this.schema, this.removeAdditional);

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

  async scan(query, fields) {
    const params = {
      TableName: this.tableName,
      FilterExpression: query.filter,
      ExpressionAttributeValues: query.values
    };

    if (query.names) {
      params.ExpressionAttributeNames = query.names;
    }

    if (fields) {
      params.ProjectionExpression = fields;
    }

    return this.dynamodb.scan(params).promise();
  }

  async delete(item) {
    const params = {
      TableName: this.tableName,
      Key: item
    };

    return this.dynamodb.delete(params).promise();
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
    return this.update(key, { status });
  }


  /**
   * Marks the record is failed with proper status
   * and error message
   *
   */
  async hasFailed(key, err) {
    err = typeof err === 'object' ? JSON.stringify(err) : err;

    return this.update(
      key,
      { status: 'failed', error: err, isActive: false }
    );
  }
}

export class Provider extends Manager {
  constructor() {
    super(process.env.ProvidersTable, providerSchema);
    this.removeAdditional = 'all';
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
    return super.create(items);
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
    return this.update(
      { name: name },
      { status: 'ingesting', isActive: true },
      ['error'] // keys to delete
    );
  }
}

export class Collection extends Manager {
  static recordIsValid(item, schema = null) {
    super.recordIsValid(item, schema, 'all');

    // make sure inputFiles and outputFiles of processStep
    // match the keys in files
    const recipeFiles = [
      item.recipe.processStep.config.inputFiles,
      item.recipe.processStep.config.outputFiles
    ];
    const fileKeys = Object.keys(item.granuleDefinition.files);

    recipeFiles.forEach((rf) => {
      const test = rf.map(x => fileKeys.includes(x)).every(x => x);
      if (!test) throw new ValidationError('inputFiles don\'t match files keys');
    });

    // make sure order items matches recipe keys
    const recipeKeys = Object.keys(item.recipe);
    let test = item.recipe.order.map(x => recipeKeys.includes(x)).every(x => x);
    if (!test) throw new ValidationError('recipe order items don\'t match recipe keys');

    // test granuleId extraction and validation regex
    const extraction = new RegExp(item.granuleDefinition.granuleIdExtraction);
    const match = item.granuleDefinition.sampleFileName.match(extraction);

    if (!match) {
      throw new ValidationError(
        'granuleIdExtraction regex returns null when applied to sampleFileName'
      );
    }

    let validation = new RegExp(item.granuleDefinition.granuleId);
    test = validation.test(match[1]);

    if (!test) {
      throw new ValidationError('granuleId regex cannot validate output of granuleIdExtraction');
    }

    // test if neededForProcessing matches files keys
    test = item.granuleDefinition.neededForProcessing.map(x => fileKeys.includes(x)).every(x => x);

    if (!test) {
      throw new ValidationError('neededForProcessing items don\'t match files keys');
    }

    // make sure regex rules for files are correct
    fileKeys.forEach((key) => {
      validation = new RegExp(item.granuleDefinition.files[key].regex);
      test = validation.test(item.granuleDefinition.files[key].sampleFileName);
      if (!test) throw new ValidationError(`Regex rule for file ${key} is invalid`);
    });
  }

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

  /**
   * Depending on the type of Error, this method might
   * generate a PDRD message for the providers
   *
   */
  async hasFailed(key, err) {
    const error = typeof err === 'object' ? JSON.stringify(err) : err;
    const values = {
      status: 'failed',
      error: error,
      isActive: false
    };

    if (err instanceof PDRParsingError) {
      // generate PDRD message
      const pdrd = pvl.jsToPVL(
        new pvl.models.PVLRoot()
               .add('MESSAGE_TYPE', new pvl.models.PVLSymbol('SHORTPDRD'))
               .add('DISPOSITION', new pvl.models.PVLTextString(err.message))
      );

      values.PDRD = pdrd;
      values.PDRDSent = false;
    }

    return this.update(key, values);
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

      const test = new RegExp(file.regex);

      files.forEach((element) => {
        const name = element.filename;

        if (name.match(test)) {
          file.name = name;
          file.sipFile = element.url;
        }
      });

      // if this is a sip file and it is not provided
      // throw an error because a file is missing
      if (file.source === 'sips' && !file.sipFile) {
        throw new Error(`Granule file ${key} of ${granuleId} is missing. Cannot create record!`);
      }

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

  async ingestCompleted(key, granule) {
    const record = await this.get(key);

    const updatedRecord = {};
    const recordFiles = record.files;

    for (const file of granule.files) {
      for (const fileDefintion of Object.entries(recordFiles)) {
        // get fileName from uri and regex from file definition
        const test = new RegExp(fileDefintion[1].regex);

        // if file belong to the fileDefinition group
        if (file.filename.match(test)) {
          const s3Uri = `s3://${process.env.internal}/staging/${file.filename}`;
          recordFiles[fileDefintion[0]].sipFile = file.url;
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

    return this.update(key, updatedRecord);
  }


  /**
   * Adds current time for various reasons to the granule record
   * For example granulePushedToCmr or processingCompleted or processingFailed
   */
  async addTime(key, fieldName) {
    const values = {};
    values[fieldName] = Date.now();
    return this.update(key, values);
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
    return this.update(key, { duration: parseFloat(duration) });
  }

}
