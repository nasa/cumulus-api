'use strict';

import _ from 'lodash';
import { validate } from 'jsonschema';
import { collection as schema } from 'cumulus-common/schemas';
import { datasetTableName } from 'cumulus-common/tables';
import { esQuery } from 'cumulus-common/es';
import * as db from 'cumulus-common/db';

function parseRecipe(record) {
  const updatedRecord = Object.assign({}, record);
  if (_.has(record, 'dataPipeLine.recipe')) {
    updatedRecord.dataPipeLine.recipe = JSON.parse(record.dataPipeLine.recipe);
  }
  return updatedRecord;
}

export function list(event, context, cb) {
  esQuery({
    query: {
      match: { _index: datasetTableName }
    }
  }, (err, res) => {
    const parsed = res.map(r => parseRecipe(r));
    return cb(err, parsed);
  });
}

export function get(event, context, cb) {
  const name = _.get(event, 'path.short_name');
  if (!name) {
    return cb('Get requires path.short_name');
  }
  esQuery({
    query: {
      bool: {
        must: [
          { match: { _index: datasetTableName } },
          { match: { name } }
        ]
      }
    }
  }, (err, res) => {
    if (err) return cb(err);

    // Cannot have more than 1 document, because `name` is the primary Dynamo key
    if (res.length === 0) {
      return cb('Record was not found');
    }

    return cb(null, parseRecipe(res[0]));
  });
}

export function post (event, context, cb) {
  const data = _.get(event, 'body', {});
  const model = validate(data, schema);
  if (model.errors.length) {
    let errors = JSON.stringify(model.errors.map(e => e.message));
    return cb('Invalid POST: ' + errors);
  }
  const query = {
    key: 'collectionName',
    value: data.collectionName,
    table: datasetTableName
  };
  db.get(query, function (error, collection) {
    if (error) {
      return cb(error);
    } else if (!collection) {
      return db.save({data, table: datasetTableName}, cb);
    } else {
      return cb('Record already exists');
    }
  });
}

export function put (event, context, cb) {
  const data = _.get(event, 'body', {});
  const model = validate(data, schema);
  if (model.errors.length) {
    let errors = JSON.stringify(model.errors.map(e => e.message));
    return cb('Invalid POST: ' + errors);
  }
  const query = {
    key: 'collectionName',
    value: data.collectionName,
    table: datasetTableName,
  };
  db.get(query, function (error, collection) {
    if (error) {
      return cb(error);
    } else if (collection) {
      // Even though putItem is an "update", db#save will
      // completely replace an item with the same ID if it exists.
      // This is simpler than an actual update function would be.
      return db.save({data, table: datasetTableName}, cb);
    } else {
      return cb('Record was not found!');
    }
  });
}
