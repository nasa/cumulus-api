'use strict';

import _ from 'lodash';
import { DynamoDB } from 'aws-sdk';
import { dataSetSchema } from 'cumulus-common/schemas';
import { datasetTableName } from 'cumulus-common/tables';
import { esQuery } from 'cumulus-common/es';
import createModel from 'cumulus-common/model';
import db from 'cumulus-common/db';

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
    const newRes = res.map(r => parseRecipe(r));
Dy
    return cb(err, newRes);
  });
}

export function get(event, context, cb) {
  esQuery({
    query: {
      bool: {
        must: [
          { match: { _index: datasetTableName } },
          { match: { name: event.path.short_name } }
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
  const postedRecord = _.get(event, 'body', {});
  db.get({ name: postedRecord.name }, function (collection) {
    if (!collection) {
      return db.save(postedRecord, function (postedCollection) {
        cb(null, postedCollection)
      });
    } else {
      return cb('Record already exists');
    }
  });
}

export function put(event, context, cb) {
  const postedRecord = _.get(event, 'body', {});
  const name = postedRecord.name;
  const update = _.omit(postedRecord, ['name']);
  db.get({ name }, function (collection) {
    if (collection) {
      return db.update({ name }, update, function (updatedCollection) {
        cb(null, updatedCollection);
      });
    } else {
      return cb('Record was not found!');
    }
  });
}
