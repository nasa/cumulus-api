'use strict';
import queue from 'queue-async';
import { localRun } from 'cumulus-common/local';
import { Search } from 'cumulus-common/es/search';
import { AttributeValue } from 'dynamodb-data-types';
import { get } from 'lodash';
import example from 'cumulus-common/tests/data/dynamo-to-es/granule-insert.json';
const unwrap = AttributeValue.unwrap;

const index = process.env.StackName || 'cumulus-local-test';

function deleteRecord(params, callback) {
  const esClient = Search.es();

  // if it is a Granule record use delete by query
  // so granule records in the main type and parent/child
  // types are deleted at the same. otherwise, use
  // the regular delete
  if (params.type === process.env.GranulesTable) {
    esClient.deleteByQuery({
      index: params.index,
      body: {
        query: {
          match: {
            'granuleId.keyword': params.id
          }
        }
      }
    }, callback);
  }
  else {
    esClient.get(params, (error, response, status) => {
      if (status !== 200) {
        return callback(null, null);
      }
      esClient.delete(params, (e, r) => {
        if (e) {
          callback(e);
        }
        else {
          callback(null, r);
        }
      });
    });
  }
}

function saveRecord(data, params, callback) {
  const esClient = Search.es();
  esClient.get(params, (error, response, status) => {
    if (status !== 200 && status !== 404) {
      callback(error);
    }
    const exists = status === 200;
    const body = [];

    const h = (e, s) => {
      if (s === 200 || s === 201) {
        console.log('Record(s) saved to Elasticsearch');
        callback(null, data);
      }
      else {
        console.error(e);
        callback(e || new Error('Could not write record'));
      }
    };

    params = { _index: params.index, _type: params.type, _id: params.id };

    // if it is granule record we use bulk update
    // this handles Granule parent/child relationships
    // this is needed to simplify running aggregations on granules
    // from Collections and PDRs tables
    if (params._type === process.env.GranulesTable) {
      console.log('Handing parent/child relations for the Granule Record');
      const granuleRelationTypes = [
        [`${process.env.CollectionsTable}Granules`, 'collectionName'],
        [`${process.env.PDRsTable}Granules`, 'pdrName']
      ];
      // adding two extra types for granule parent/child relation
      // we only record the fields we need for aggregations
      const dataSummary = {
        granuleId: data.granuleId,
        granuleStatus: data.status,
        granuleDuration: data.duration,
        createdAt: data.createdAt
      };

      granuleRelationTypes.forEach(g => {
        const newParams = Object.assign({}, params);
        newParams._type = g[0];
        newParams._parent = data[g[1]];
        body.push({ index: newParams });
        body.push(dataSummary);
      });
    }

    // use update action if the record already exists
    // this seems to have some performance
    let action = 'create';
    if (exists) {
      action = 'update';
      data = { doc: data };
    }

    body.push({ [action]: params });
    body.push(data);

    // using bulk updater to update elasticsearch
    // this is useful for the case of granules where the same
    // record is put into three different es types (tables)
    esClient.bulk({ body: body }, h);
  });
}

function processRecords(event, done) {
  const q = queue();
  const records = get(event, 'Records');
  console.log('Processing records');
  if (!records) {
    return done(null, 'No records found in event');
  }
  records.forEach((record) => {
    // get table name from the record information
    // we use table name as the type in ES
    const tableArn = record.eventSourceARN.match(/table\/(.*)\/stream/);
    const type = tableArn[1];

    // now get the hash and range (if any) and use them as id key for ES
    const keys = unwrap(get(record, 'dynamodb.Keys'));
    const ids = Object.keys(keys).map(k => keys[k]);
    const id = ids.join('_');

    console.log(`Received ${id} from the stream`);

    if (id) {
      const params = { index, type, id };
      if (record.eventName === 'REMOVE') {
        console.log(`Deleting ${id} from ${type}`);
        q.defer((callback) => deleteRecord(params, callback));
      }
      else {
        const data = unwrap(record.dynamodb.NewImage);
        console.log(`Adding/Updating ${id} to ${type}`);
        q.defer((callback) => saveRecord(data, params, callback));
      }
    }
    else {
      // defer an error'd callback so we can handle it in awaitAll.
      q.defer((callback) =>
        callback(new Error(`Could not construct a valid id from ${keys}`))
      );
    }
  });

  q.awaitAll((error, result) => {
    if (error) {
      done(null, error.message);
    }
    else {
      done(null, `Records altered: ${result.filter(Boolean).length}`);
    }
  });
}

/**
 * Sync changes to dynamodb to an elasticsearch instance.
 * Sending updates to this lambda is handled by automatically AWS.
 * @param {array} Records list of records with an eventName property signifying REMOVE or INSERT.
 * @return {string} response text indicating the number of records altered in elasticsearch.
 */
export function handler(event, context, done) {
  const esClient = Search.es();
  esClient.indices.exists({ index }, (error, response, status) => {
    if (status === 404) {
      console.log(`${index} doesn't exist. Creating it`);
      esClient.indices.create({ index }, (e) => {
        if (e) {
          done(null, e.message);
        }
        else {
          console.log(`Index ${index} created on ES`);
          processRecords(event, done);
        }
      });
    }
    else if (status === 200) {
      processRecords(event, done);
    }
    else {
      done(null, error.message);
    }
  });
}

localRun(() => {
  handler(example, null, (e, r) => console.log(e, r));
});
