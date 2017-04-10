'use strict';

import path from 'path';
import { Manager } from './base';

import { SQS } from '../aws-helpers';
import { Collection } from './collections';
import { Provider } from './providers';
import { granule as granuleSchema } from '../schemas';


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
  static async buildRecord(
    collectionName, pdrName, granuleId, files, provider, collectionObj = null
  ) {
    const granuleRecord = {
      granuleId,
      collectionName,
      pdrName,
      provider
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
          file.size = element.fileSize;
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

  /**
   * Generates the payload for processing
   *
   */
  static generatePayload(record, step = 0) {
    // a payload indicates that we are processing/reprocessing
    // a record. Thus we have to make sure a few of the fields
    // are resetted
    delete record.error;

    if (record.timeline) {
      let i = step;
      for (i; i < record.recipe.order.length; i++) { // eslint-disable-line
        record.timeline[record.recipe.order[i]] = {};
      }
    }

    const payload = {
      previousStep: 0,
      nextStep: step,
      granuleRecord: record
    };

    return payload;
  }

  async unpublish(granuleId) {
    return this.update({ granuleId }, { published: false }, ['cmrLink']);
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

  async reingest(granuleId) {
    const record = await this.get({ granuleId });
    const pr = new Provider();

    // get provider record
    const provider = await pr.get({ name: record.provider });

    // get files for reingest
    let files = Object.keys(record.files).filter((k) => {
      if (record.files[k].source === 'sips') {
        return true;
      }
      return false;
    });

    files = files.map((k) => {
      const file = record.files[k];
      return {
        path: path.dirname(file.sipFile.replace(provider.host, '')),
        filename: file.name,
        fileSize: file.size,
        url: file.sipFile
      };
    });

    const message = {
      granuleId,
      protocol: provider.protocol,
      provider: provider.name,
      host: provider.host,
      pdrName: record.pdrName,
      collectionName: record.collectionName,
      files,
      isDuplicate: false
    };

    // update state of granule
    this.update({ granuleId }, {
      status: 'ingesting',
    }, [
      'error',
      'timeline',
      'archiveDuration',
      'processStepDuration',
      'totalDuration',
      'cmrDuration',
      'processingDuration'
    ]);

    return SQS.sendMessage(process.env.GranulesQueue, message);
  }
}
