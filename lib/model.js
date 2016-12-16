'use strict';

import {
  isObject,
  isArray,
  isUndefined,
  isFunction,
  isNil,
  get,
  assign
} from 'lodash';

/* Given a schema, return a validator function.
 *
 * Validator function evaluates raw data and returns an object:
 * {
 *  errors: [],
 *  data: {},
 *  schema: {}
 * }
 *
 * Errors is an array of objects, each of which should contain
 * at minimum a `message` property.
 *
 * Data is the validated data. Only properties that exist on the
 * schema will be included in data.
 *
 * `schema` is a reference to the original schema.
 */
export default function create (schema) {
  if (isNil(schema) || !isObject(schema)) {
    throw new Error('A schema object must be passed to model#create');
  }
  const validate = function (raw) {
    if (isUndefined(raw) || !isObject(raw)) {
      return {
        errors: [requiredNotFound('Raw data object')],
        data: null,
        schema
      }
    }
    const { data, errors } = validateRawObject (raw, schema);

    if (schema._hashkey) {
      // do something with hashkey property
    }

    if (schema._meta) {
      assign(data, schema._meta);
    }

    return { data, errors, schema };
  }
  return validate;
};

// convenience object for passing errors on required fields
function requiredNotFound (entity) {
  return {
    value: 'undefined',
    operator: 'Boolean',
    actual: 'undefined',
    message: entity + ' is required'
  };
}

const meta = ['_hashkey', '_required', '_defaults', '_type', '_meta'];

// parse and validate a raw object based on a given schema
function validateRawObject (raw, schema) {
  if (schema._type !== 'map') {
    console.warn('Expected schema._type "map" in model#validateRawObject');
    console.warn('Found', schema._type);
  }

  // do some validation on defaults and required properties
  const defaults = schema.hasOwnProperty('_defaults') &&
    isObject(schema._defaults) ? schema._defaults : {};
  const required = schema.hasOwnProperty('_required') &&
    isArray(schema._required) &&
    schema._required.length ? schema._required : [];

  const data = {};
  let errors = [];

  for (let key in schema) {
    // schema has meta properties that should be ignored
    if (meta.indexOf(key) >= 0) { continue; }

    let validator = schema[key];
    let value = get(raw, key);
    // if nil and has default, apply default
    if (isNil(value) && defaults.hasOwnProperty(key)) {
      value = isFunction(defaults[key]) ? defaults[key]() : defaults[key];
    }

    // check if the value is still nil but is required
    if (isNil(value)) {
      if (required.indexOf(key) === -1) {
        continue;
      } else {
        errors.push(requiredNotFound(key));
      }
    } else if (isObject(validator) && validator.hasOwnProperty('_type')) {
      // if the validator is an object, parse it recursively
      if (validator._type === 'map' && isObject(value)) {
        let next = validateRawObject(value, validator);
        if (next.errors.length) {
          errors = errors.concat(next.errors);
        }
        data[key] = next.data;
      }
    } else {
      data[key] = value;
      let validationErrors = validator(value).errors;
      if (validationErrors.length) {
        errors = errors.concat(validationErrors);
      }
    }
  }

  return { data, errors };
}
