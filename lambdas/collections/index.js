'use strict';

import _ from 'lodash';
import { validate } from 'jsonschema';
import { collection as schema } from 'cumulus-common/schemas';
import { esList, esQuery } from 'cumulus-common/es';
import * as db from 'cumulus-common/db';

const table = process.env.CollectionsTable || 'table';
const index = process.env.StackName || 'cumulus-local-test';
const key = 'collectionName';

function parseRecipe(record) {
  const updatedRecord = Object.assign({}, record);
  if (_.has(record, 'dataPipeLine.recipe')) {
    updatedRecord.dataPipeLine.recipe = JSON.parse(record.dataPipeLine.recipe);
  }
  return updatedRecord;
}

/**
 * List all collections.
 * @return {array} every collection in the database.
 */
export function list (event, context, cb) {
  esList(index, table, (error, res) => {
    if (error) {
      return cb(error);
    } else {
      const parsed = res.map(r => parseRecipe(r));
      return cb(null, parsed);
    }
  });
}

/**
 * Query a single collection.
 * @param {string} collectionName the name of the collection.
 * @return {object} a single collection object.
 */
export function get (event, context, cb) {
  const name = _.get(event, 'collectionName');
  if (!name) {
    return cb('Collection#get requires a collectionName property');
  }
  esQuery(index, table, {
    query: {
      bool: {
        must: [
          { match: { [key]: name } }
        ]
      }
    }
  }, (error, res) => {
    if (error) {
      return cb(error);
    } else if (res.length === 0) {
      return cb('Record was not found');
    } else {
      // Cannot have more than 1 document, because `collectionName` is the primary Dynamo key
      return cb(null, parseRecipe(res[0]));
    }
  });
}

/**
 * Creates a new collection
 * @param {object} body a collection object to save in the database.
 * @return {object} returns the collection that was just saved.
 */
export function post (event, context, cb) {
  const data = _.get(event, 'body', {});
  const model = validate(data, schema);
  if (model.errors.length) {
    let errors = JSON.stringify(model.errors.map(e => e.message));
    return cb('Invalid POST: ' + errors);
  }
  const query = {
    value: data.collectionName,
    key,
    table
  };
  db.get(query, function (error, collection) {
    if (error && error.errorType !== 'ResourceNotFoundException') {
      return cb(error);
    } else if (_.isEmpty(collection)) {
      return db.save({data, table}, cb);
    } else {
      return cb('Record already exists');
    }
  });
}

/**
 * Updates an existing collection
 * @param {object} body a set of properties to update on an existing collection.
 * @return {object} a mapping of the updated properties.
 */
export function put (event, context, cb) {
  const data = _.get(event, 'body', {});
  const model = validate(data, schema);
  if (model.errors.length) {
    let errors = JSON.stringify(model.errors.map(e => e.message));
    return cb('Invalid POST: ' + errors);
  }
  const name = data.collectionName;
  const update = _.omit(data, [key]);
  const query = {
    value: name,
    key,
    table
  };
  db.get(query, function (error, collection) {
    if (error) {
      return cb(error);
    } else if (_.isEmpty(collection)) {
      return cb('Collection not found');
    } else {
      return db.update({
        value: name,
        data: update,
        key,
        table
      }, cb);
    }
  });
}
