'use strict';

var _ = require('lodash');
var utils = require('../utils');
var splunkService = require('../splunk');

module.exports.getErrorCounts = function (req, cb) {
  // This query relies on `is_error` being 0 or 1
  let query = 'search index=main | stats sum(is_error) by dataset_id';

  let params = {
    output_mode: 'JSON',
    // Setting count to 0 returns _all_ records
    count: 0
  };

  if (_.get(req, ['query', 'earliestDate'])) { params.earliestDate = `${utils.getEarliestDate(req.query)}T00:00:00.000`; }
  if (_.get(req, ['query', 'latestDate'])) { params.earliestDate = `${utils.getLatestDate(req.query)}T24:00:00.000`; }

  splunkService.oneshotSearch(query, params, (err, results) => {
    if (err) { return cb(err.message, null); }

    results = results.results;

    var response = [];
    results.map(result => {
      if (result.dataset_id !== 'None') {
        result.count = parseInt(result['sum(is_error)']);
        delete result['sum(is_error)'];

        response.push(result);
      }
    });

    return cb(null, response);
  });
};

module.exports.listErrors = function (req, cb) {
  const FIELDS_TO_RETURN = ['timestamp', 'dataset_id', 'process', 'message'];

  // If no dataset is specified, return all datasets
  let datasetID = _.hasIn(req, ['path', 'dataSet']) || '*';

  // Splunk's query syntax is case-insensitive, including in parameters
  let query = `search index=main dataset_id="${datasetID}" is_error=1 | fields ${FIELDS_TO_RETURN.join(',')}`;

  let params = {
    output_mode: 'JSON',
    count: utils.getLimit(req.query)
  };

  if (_.get(req, ['query', 'earliestDate'])) { params.earliestDate = `${utils.getEarliestDate(req.query)}T00:00:00.000`; }
  if (_.get(req, ['query', 'latestDate'])) { params.earliestDate = `${utils.getLatestDate(req.query)}T24:00:00.000`; }

  splunkService.oneshotSearch(query, params, (err, results) => {
    if (err) { return cb(err.message, null); }

    let fullResults = results.results;
    results = [];

    fullResults.forEach(fullResult => {
      let result = {};
      FIELDS_TO_RETURN.forEach(field => {
        result[field] = fullResult[field];
      });
      results.push(result);
    });

    return cb(null, results);
  });
};
