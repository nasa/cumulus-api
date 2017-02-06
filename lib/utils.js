'use strict';

import _ from 'lodash';

// returns token if present in the Authorization section of header
export function getToken(header) {
  const authorization = _.get(header, 'Authorization', null);
  const token = authorization.match(/^Token ([^\s]*)$/);
  if (token) {
    return token[1];
  }

  return null;
}

export function getLimit(query) {
  return _.toInteger(_.get(query, 'limit', 100));
}

export function getEarliestDate(query) {
  return _.get(query, 'earliestDate');
}

export function getLatestDate(query) {
  return _.get(query, 'latestDate');
}

export function getStart(field, type, query) {
  return _.toInteger(_.get(query, 'start_at', 0));
}

// Converts an AWS datapipline template to the format
// accepted by aws-sdk
export function pipelineTemplateConverter(arr, fieldName) {
  return arr.map(obj => {
    const newObj = {};
    newObj[fieldName] = [];

    _.mapKeys(obj, (value, key) => {
      if (key === 'id' || key === 'name') {
        newObj[key] = value;
      }
      else {
        const field = {
          key: key
        };
        if (_.has(value, 'ref')) {
          field.refValue = value.ref;
        }
        else if (_.isArray(value)) {
          field.stringValue = value[0];
        }
        else if (_.isString(value)) {
          field.stringValue = value;
        }
        newObj[fieldName].push(field);
      }
    });

    return newObj;
  });
}
