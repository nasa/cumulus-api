'use strict';

import _ from 'lodash';
import { validate } from 'jsonschema';
import { collection as schema } from 'cumulus-common/schemas';
import { collectionsTableName as table } from 'cumulus-common/tables';
import { esQuery } from 'cumulus-common/es';
import * as db from 'cumulus-common/db';

const key = 'collectionName';

function parseRecipe(record) {
  const updatedRecord = Object.assign({}, record);
  if (_.has(record, 'dataPipeLine.recipe')) {
    updatedRecord.dataPipeLine.recipe = JSON.parse(record.dataPipeLine.recipe);
  }
  return updatedRecord;
}

export function list (event, context, cb) {
  esQuery({
    query: {
      match: { _index: table }
    }
  }, (error, res) => {
    if (error) {
      return cb(error);
    } else {
      const parsed = res.map(r => parseRecipe(r));
      return cb(null, parsed);
    }
  });
}

export function get (event, context, cb) {
  const name = _.get(event, 'path.short_name');
  if (!name) {
    return cb('Get requires path.short_name');
  }
  esQuery({
    query: {
      bool: {
        must: [
          { match: { _index: table } },
          { match: { name } }
        ]
      }
    }
  }, (error, res) => {
    if (error) {
      return cb(error);
    } else if (res.length === 0) {
      return cb('Record was not found');
    } else {
      // Cannot have more than 1 document, because `name` is the primary Dynamo key
      return cb(null, parseRecipe(res[0]));
    }
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
