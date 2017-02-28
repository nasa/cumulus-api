'use strict';

import _ from 'lodash';
import { validate } from 'jsonschema';
import { collection as schema } from 'cumulus-common/schemas';
import * as db from 'cumulus-common/db';

import { Search } from 'cumulus-common/es/search';

function parseRecipe(record) {
  const updatedRecord = Object.assign({}, record);
  if (_.has(record, 'dataPipeLine.recipe')) {
    updatedRecord.dataPipeLine.recipe = JSON.parse(record.dataPipeLine.recipe);
  }
  return updatedRecord;
}

/**
 * List all collections.
 * @param {object} event aws lambda event object.
 * @param {object} context aws lambda context object
 * @param {callback} cb aws lambda callback function
 * @return {undefined}
 */
export function list(event, context, cb) {
  const search = new Search(event, process.env.CollectionsTable);
  search.query(false, true).then((response) => cb(null, response)).catch((e) => {
    cb(e);
  });
}

/**
 * Query a single collection.
 * @param {string} collectionName the name of the collection.
 * @param {string} granuleId the id of the granule.
 * @return {object} a single granule object.
 */
export function get(event, context, cb) {
  const name = _.get(event.params, 'short_name');
  if (!name) {
    return cb('Collection#get requires a short_name property');
  }

  const search = new Search({}, process.env.CollectionsTable);
  search.get(name, false, true).then((response) => {
    //if (response.results.length === 0) {
      //return cb({ detail: 'Record was not found' });
    //}
    cb(null, response);
  }).catch((e) => {
    cb(e);
  });
}

/**
 * Creates a new collection
 * @param {object} body a collection object to save in the database.
 * @return {object} returns the collection that was just saved.
 */
export function post (event, context, cb) {
  const key = 'collectionName';
  const table = process.env.CollectionsTable;
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
  const key = 'collectionName';
  const table = process.env.CollectionsTable;
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
