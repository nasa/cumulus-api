'use strict';

import _ from 'lodash';
import dynamoose from 'dynamoose';
import { dataSetSchema } from 'cumulus-common/schemas';
import { datasetTableName } from 'cumulus-common/tables';
import { esQuery } from 'cumulus-common/es';

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

export function post(event, context, cb) {
  const Dataset = dynamoose.model(datasetTableName, dataSetSchema, { create: false });

  const postedRecord = _.get(event, 'body', {});

  Dataset.get({ name: postedRecord.name }, (err, collection) => {
    if (err) {
      return cb(err);
    }
    if (!collection) {
      const newRecord = new Dataset(postedRecord);
      newRecord.save(error => cb(error, postedRecord));
    }

    return cb('Record already exists');
  });
}

export function put(event, context, cb) {
  const Dataset = dynamoose.model(datasetTableName, dataSetSchema, { create: false });

  const postedRecord = _.get(event, 'body', {});
  const name = postedRecord.name;
  const update = _.omit(postedRecord, ['name']);

  Dataset.get(name, (err, collection) => {
    if (err) {
      return cb(err);
    }

    if (collection) {
      Dataset.update(name, update, (error, updatedCollection) => {
        if (error) {
          return cb(error);
        }
        cb(error, updatedCollection);
      });
    }

    return cb('Record was not found!');
  });
}
