/* This code is copied from sat-api-lib library
 * with some alterations.
 * source: https://raw.githubusercontent.com/sat-utils/sat-api-lib/master/libs/queries.js
 */

'use strict';

import _ from 'lodash';


function generalQuery(params) {
  return {
    query_string: {
      query: params.q
    }
  };
}

function prefixQuery(params) {
  const fields = [
    'granuleId',
    'status',
    'pdrName',
    'collectionName',
    'userName'
  ];

  const query = {
    bool: {
      should: []
    }
  };

  fields.forEach((f) => {
    query.bool.should.push({
      prefix: {
        [`${f}.keyword`]: params.prefix
      }
    });
  });

  return query;
}


function termQuery(field, value) {
  const query = {
    match_phrase: {}
  };

  query.match_phrase[field] = value;
  return query;
}

function rangeQuery(field, frm, to) {
  const query = {
    range: {}
  };
  query.range[field] = {};

  if (frm) {
    query.range[field].gte = frm;
  }

  if (to) {
    query.range[field].to = to;
  }

  return query;
}


export default function(params) {
  const sortBy = params.sort_by || 'timestamp';
  const order = params.order || 'desc';

  const response = {
    query: { match_all: {} },
    sort: [
      { [sortBy]: { order: order } }
    ]
  };
  const queries = [];

  params = _.omit(params, ['limit', 'page', 'skip', 'sort_by', 'order']);

  if (Object.keys(params).length === 0) {
    return response;
  }

  const rangeFields = {};

  // Do general search
  if (params.q) {
    response.query = generalQuery(params);
    return response;
  }

  // Do prefix search
  if (params.prefix) {
    response.query = prefixQuery(params);
    return response;
  }

  // distinguish term and range fields
  const termFields = Object.entries(params).map((element) => {
    const key = element[0];
    const value = element[1];

    const match = key.match(/^(.*)_(from|to)$/);
    if (match) {
      const field = match[1];
      const direction = match[2];
      if (!rangeFields.hasOwnProperty(field)) {
        rangeFields[field] = {};
      }
      rangeFields[field][direction] = value;
      return false;
    }
    // if it doesn't have iether from or to
    // it is a term field
    return {
      field: key,
      value: value
    };
  });

  // Range search
  Object.entries(rangeFields).forEach((element) => {
    queries.push(
      rangeQuery(
        element[0],
        element[1].from,
        element[1].to
      )
    );
    //params = _.omit(params, [_.get(value, 'from'), _.get(value, 'to')]);
  });

  // Term search
  termFields.forEach((element) => {
    if (element) {
      queries.push(
        termQuery(
          element.field,
          element.value
        )
      );
    }
  });

  response.query = {
    bool: {
      must: queries
    }
  };

  return response;
}
