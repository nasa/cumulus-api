'use strict';

import moment from 'moment';
import { Search } from 'cumulus-common/es/search';

export function summary(event, context, cb) {
  const search = new Search(event);
  search.count().then((r) => cb(null, r)).catch(e => cb(e));
}

export function summaryGrouped(event, context, cb) {
  const dateFormat = 'MM/DD/YYYY hh:mm:ss Z';
  const now = moment().format(dateFormat);
  return cb(null, {
    collections: {
      dateFrom: moment('1970-01-01').format(dateFormat),
      dateTo: now,
      value: 10,
      aggregation: 'count',
      unit: 'collection'
    },
    granules: {
      dateFrom: moment().subtract(1, 'weeks').format(dateFormat),
      dateTo: now,
      value: 1001214,
      aggregation: 'count',
      unit: 'granule'
    },
    errors: {
      dateFrom: moment().subtract(1, 'weeks').format(dateFormat),
      dateTo: now,
      value: 123,
      aggregation: 'count',
      unit: 'error'
    },
    storage: {
      dateFrom: moment('1970-01-01').format(dateFormat),
      dateTo: now,
      value: 1234,
      aggregation: 'count',
      unit: 'GB'
    },
    ec2: {
      dateFrom: now,
      dateTo: now,
      value: 3,
      aggregation: 'count',
      unit: 'instance'
    },
    queues: {
      dateFrom: now,
      dateTo: now,
      value: 5,
      aggregation: 'count',
      unit: 'queue'
    },
    processingTime: {
      dateFrom: moment().subtract(1, 'weeks').format(dateFormat),
      dateTo: now,
      value: 12,
      aggregation: 'average',
      unit: 'second'
    }
  });
}
