/* This code is copied from sat-api-lib library
 * with some alterations.
 * source: https://raw.githubusercontent.com/sat-utils/sat-api-lib/master/libs/queries.js
 */
'use strict';

import _ from 'lodash';


function legacyParams(params) {
  return {
    query_string: {
      query: params.search
    }
  };
}

function termQuery(field, value) {
  const query = {
    match: {}
  };

  query.match[field] = {
    query: value,
    lenient: false,
    zero_terms_query: 'none'
  };

  return query;
}

function rangeQuery(field, frm, to) {
  const query = {
    range: {}
  };

  query.range[field] = {
    gte: frm,
    lte: to
  };

  return query;
}


export default function(params) {
  const response = {
    query: { match_all: {} },
    sort: [
      { createdAt: { order: 'desc' } }
    ]
  };
  const queries = [];

  params = _.omit(params, ['limit', 'page', 'skip']);

  if (Object.keys(params).length === 0) {
    return response;
  }

  const rangeFields = {};

  const termFields = [
    {
      parameter: 'scene_id',
      field: 'scene_id'
    },
    {
      parameter: 'sensor',
      field: 'satellite_name'
    }
  ];

  // Do legacy search
  if (params.search) {
    response.query = legacyParams(params);
    return response;
  }

  // select parameters that have _from or _to
  _.forEach(params, (value, key) => {
    let field = key.replace('_from', '');
    field = field.replace('_to', '');

    if (key === 'cloud_from' || key === 'cloud_to') {
      rangeFields.cloud = {
        from: 'cloud_from',
        to: 'cloud_to',
        field: 'cloud_coverage'
      };
    }
    else if (_.endsWith(key, '_from')) {
      if (_.isUndefined(rangeFields[field])) {
        rangeFields[field] = {};
      }

      rangeFields[field].from = key;
      rangeFields[field].field = field;
    }
    else if (_.endsWith(key, '_to')) {
      if (_.isUndefined(rangeFields[field])) {
        rangeFields[field] = {};
      }

      rangeFields[field].to = key;
      rangeFields[field].field = field;
    }
    else {
      return;
    }
  });

  // Range search
  _.forEach(rangeFields, (value) => {
    queries.push(
      rangeQuery(
        value.field,
        _.get(params, _.get(value, 'from')),
        _.get(params, _.get(value, 'to'))
      )
    );
    params = _.omit(params, [_.get(value, 'from'), _.get(value, 'to')]);
  });

  // Term search
  for (let i = 0; i < termFields.length; i++) {
    if (_.has(params, termFields[i].parameter)) {
      queries.push(
        termQuery(
          termFields[i].field,
          params[termFields[i].parameter]
        )
      );
    }
  }

  // For all items that were not matched pass the key to the term query
  _.forEach(params, (value, key) => {
    queries.push(termQuery(key, value));
  });

  response.query = {
    bool: {
      must: queries
    }
  };

  return response;
}
