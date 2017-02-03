'use strict';
import aws from 'aws-sdk';
import es from 'elasticsearch';
import queue from 'queue-async';

import { config } from 'cumulus-common/es';
const esClient = new es.Client(config);
const type = process.env.ES_TYPE || 'type';

// TODO include index in env variable
const index = 'index';

const handler = function(event, context) {
  esClient.indices.exists({ index }, (error, response, status) => {
    if (status === 404) {
      esClient.indices.create({ index }, (error, response, status) => {
        if (error) {
          context.fail(error);
        } else {
          processRecords(event, context);
        }
      });
    } else if (status === 200) {
      processRecords(event, context);
    } else {
      context.fail(error);
    }
  });
};

function processRecords (event, context) {
  const q = queue();
  event.Records.forEach((record) => {
    if (record.eventName === 'REMOVE') {
      // TODO do we remove records?
    } else {
      q.defer((callback) => saveRecord(record, context, callback));
    }
  });
  q.awaitAll(() => true);
}

function saveRecord (record, context, callback) {
  esClient.get({
    index,
    id: 'id',
    type
  }, (error, response, status) {
    if (status !== 200 && status !== 404) {
      context.fail(error);
    }
    const exists = status === 200;
    const params = {
      index,
      id: 'id'
      type
    };

    const handler = (error, response, status) {
      if (status === 200 || status === 201) {
        cb(record);
      } else {
        throw error || new Error('Could not write record');
      }
    };

    if (exists) {
      params.body = { doc: record };
      esClient.update(params, handler);
    } else {
      params.body = record;
      es.create(params, handler);
    }
  });
}

export default handler;
