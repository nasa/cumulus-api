'use strict';
import queue from 'queue-async';
import { AttributeValue } from 'dynamodb-data-types';
import { get } from 'lodash';
const unwrap = AttributeValue.unwrap;

import { client as esClient } from 'cumulus-common/es';
const index = process.env.StackName || 'cumulus-local-test';
const type = process.env.ES_TYPE || 'type';
const hash = process.env.DYNAMODB_HASH || 'no-hash-env';
const range = process.env.DYNAMODB_RANGE || 'NONE';

export const handler = function(event, context, done) {
  console.log(JSON.stringify(event));
  esClient.indices.exists({ index }, (error, response, status) => {
    if (status === 404) {
      esClient.indices.create({ index }, (error, response, status) => {
        if (error) {
          done(null, error.message);
        } else {
          processRecords(event, done);
        }
      });
    } else if (status === 200) {
      processRecords(event, done);
    } else {
      done(null, error.message);
    }
  });
};

function processRecords (event, done) {
  const q = queue();
  const records = get(event, 'Records');
  if (!records) {
    return done(null, 'No records found in event');
  }
  records.forEach((record) => {
    const keys = unwrap(get(record, 'dynamodb.Keys'));
    const hashValue = keys[hash];
    if (hashValue) {
      const id = range === 'NONE' ? hashValue : hashValue + '|' + keys[range];
      const params = { index, type, id };
      if (record.eventName === 'REMOVE') {
        q.defer((callback) => deleteRecord(params, callback));
      } else {
        const data = unwrap(record.dynamodb.NewImage);
        q.defer((callback) => saveRecord(data, params, callback));
      }
    } else {
      // defer an error'd callback so we can handle it in awaitAll.
      q.defer((callback) => callback(new Error('Could not find hash value for property name ' + hash)));
    }
  });
  q.awaitAll((error, result) => {
    if (error) {
      done(null, error.message);
    } else {
      done(null, 'Records altered: ' + result.filter(Boolean).length);
    }
  });
}

function deleteRecord (params, callback) {
  esClient.get(params, (error, response, status) => {
    if (status !== 200) {
      return callback(null, null);
    }
    esClient.delete(params, function (error, response) {
      if (error) {
        callback(error);
      } else {
        callback(null, response);
      }
    });
  });
}

function saveRecord (data, params, callback) {
  esClient.get(params, (error, response, status) => {
    if (status !== 200 && status !== 404) {
      callback(error);
    }
    const exists = status === 200;
    const handler = (error, response, status) => {
      if (status === 200 || status === 201) {
        callback(null, data);
      } else {
        callback(error || new Error('Could not write record'));
      }
    };
    if (exists) {
      const update = Object.assign({}, params, {
        body: { doc: data }
      });
      esClient.update(update, handler);
    } else {
      const create = Object.assign({}, params, {
        body: data
      });
      esClient.create(create, handler);
    }
  });
}
