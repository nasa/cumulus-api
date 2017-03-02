/* This code is copied from sat-api-lib library
 * with some alterations.
 * source: https://raw.githubusercontent.com/sat-utils/sat-api-lib/master/libs/search.js
 */
'use strict';

import _ from 'lodash';
import aws from 'aws-sdk';
import httpAwsEs from 'http-aws-es';
import elasticsearch from 'elasticsearch';
import log from '../log';
import queries from './queries';
import { date, term } from './aggregations';
import { localRun } from '../local';

const logDetails = {
  file: 'lib/es/search.js',
  type: 'apigateway'
};

export class Search {
  static es() {
    let credentials;
    let esConfig;

    // this is needed for getting temporary credentials from IAM role
    if (process.env.MODE === 'local') {
      esConfig = {
        host: 'localhost:9200'
      };
    }
    else {
      if (process.env.MODE === 'remote') {
        credentials = new aws.Credentials(
          process.env.AWS_ACCESS_KEY_ID,
          process.env.AWS_SECRET_ACCESS_KEY
        );
      }
      else {
        credentials = new aws.EnvironmentCredentials('AWS');
      }

      esConfig = {
        host: process.env.ES_HOST || 'localhost:9200',
        connectionClass: httpAwsEs,
        amazonES: {
          region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
          credentials
        },

        // Note that this doesn't abort the query.
        requestTimeout: 50000  // milliseconds
      };
    }

    return new elasticsearch.Client(esConfig);
  }

  constructor(event, type = null) {
    let params;

    this.type = type;

    this.client = this.constructor.es();

    log.debug('received query:', event.query, logDetails);
    log.debug('received body:', event.body, logDetails);

    // this will allow us to receive payload
    // from GET and POST requests
    if (_.has(event, 'query') && !_.isEmpty(event.query)) {
      params = event.query;
    }
    else if (_.has(event, 'body') && !_.isEmpty(event.body)) {
      params = event.body;
    }
    else {
      params = {};
    }

    // get page number
    const page = parseInt((params.page) ? params.page : 1);
    this.params = params;
    log.debug('Generated params:', params, logDetails);

    this.size = parseInt((params.limit) ? params.limit : 1);
    this.frm = (page - 1) * this.size;
    this.page = parseInt((params.skip) ? params.skip : page);
    this.index = process.env.StackName || 'cumulus-local-test';

    if (this.type === process.env.CollectionsTable) {
      this.hash = 'collectionName';
    }
    else if (this.type === process.env.PDRsTable) {
      this.hash = 'pdrName';
    }
  }

  _buildSearch(granuleStats = false) {
    let fields;

    // if fields are included remove it from params
    if (_.has(this.params, 'fields')) {
      fields = this.params.fields;
      this.params = _.omit(this.params, ['fields']);
    }

    let body = queries(this.params);
    if (granuleStats) {
      body = Object.assign(
        {},
        body,
        this._buildGranuleStats()
      );
    }

    return {
      index: this.index,
      body: body,
      size: this.size,
      from: this.frm,
      type: this.type,
      _source: fields
    };
  }

  _buildAggregation() {
    const aggrs = { aggs: {} };

    if (_.has(this.params, 'fields')) {
      const fields = this.params.fields.split(',');

      _.forEach(fields, (field) => {
        if (field === 'createdAt') {
          aggrs.aggs = _.assign(aggrs.aggs, date(field));
        }
        else {
          aggrs.aggs = _.assign(aggrs.aggs, term(field));
        }
      });

      this.params = _.omit(this.params, ['fields']);
    }

    return {
      index: this.index,
      body: _.assign({}, aggrs, queries(this.params)),
      type: this.type,
      size: 0
    };
  }

  _buildGranuleStats() {
    const aggrs = {
      aggs: {
        hashes: {
          terms: {
            field: `${this.hash}.keyword`
          },
          aggs: {
            granuleStats: {
              children: {
                type: `${this.type}Granules`
              },
              aggs: {
                statusCount: {
                  terms: {
                    field: 'granuleStatus.keyword'
                  }
                },
                averageDuration: {
                  avg: {
                    field: 'granuleDuration'
                  }
                },
                granulesCount: {
                  value_count: {
                    field: 'granuleId.keyword'
                  }
                }
              }
            }
          }
        }
      }
    };

    return aggrs;
  }

  _metaTemplate() {
    return {
      name: 'cumulus-api',
      table: this.type
    };
  }

  _getGranuleStats(results) {
    if (this.hash) {
      const status = {
        failed: 0,
        ingesting: 0,
        processing: 0,
        archiving: 0,
        cmr: 0,
        completed: 0,
        total: 0
      };
      const objs = {};

      results.hits.hits.forEach(item => {
        objs[item._source[this.hash]] = item._source;
      });

      results.aggregations.hashes.buckets.forEach(item => {
        if (objs.hasOwnProperty(item.key)) {
          const newObj = {
            averageDuration: item.granuleStats.averageDuration.value,
            granules: item.granuleStats.granulesCount.value,
            granulesStatus: Object.assign({}, status)
          };

          item.granuleStats.statusCount.buckets.forEach(b => {
            newObj.granulesStatus[b.key] = b.doc_count;
          });

          newObj.granulesStatus.total = newObj.granules;

          objs[item.key] = Object.assign({}, objs[item.key], newObj);
        }
      });

      return Object.values(objs);
    }
  }

  async get(id, granuleStats = false) {
    try {
      let body = {
        query: {
          term: {
            _id: id
          }
        }
      };

      if (granuleStats) {
        body = Object.assign({}, body, this._buildGranuleStats());
      }

      const result = await this.client.search({
        index: this.index,
        type: this.type,
        body: body
      });

      if (result.hits.total > 1) {
        return { detail: 'More than one record was found!' };
      }
      else if (result.hits.total === 0) {
        return { detail: 'Record not found' };
      }

      let source;

      if (granuleStats) {
        source = this._getGranuleStats(result)[0];
      }
      else {
        source = result.hits.hits[0]._source;
      }

      return source;
    }
    catch (e) {
      log.error(e, logDetails);
      throw e;
    }
  }

  async query(granuleStats = false) {
    const searchParams = this._buildSearch(granuleStats);

    try {
      // search ES with the generated parameters
      const result = await this.client.search(searchParams);

      let response;
      const count = result.hits.total;

      if (granuleStats) {
        response = this._getGranuleStats(result);
      }
      else {
        response = result.hits.hits.map((s) => s._source);
      }

      const meta = this._metaTemplate();
      meta.limit = this.size;
      meta.page = this.page;
      meta.count = count;

      return {
        meta,
        results: response
      };
    }
    catch (e) {
      log.error(e, logDetails);
      return e;
    }
  }

  async count() {
    const searchParams = this._buildAggregation();

    try {
      const result = await this.client.search(searchParams);
      const count = result.hits.total;

      return {
        meta: {
          found: count,
          name: 'cumulus-api'
        },
        counts: result.aggregations
      };
    }
    catch (e) {
      log.error(e, logDetails);
      return e;
    }
  }
}

