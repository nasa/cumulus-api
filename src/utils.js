var _ = require('lodash');
var es = require('elasticsearch');
var awsES = require('http-aws-es');

// returns token if present in the Authorization section of header
var getToken = function (header) {
  var authorization = _.get(header, 'Authorization', null);
  var token = authorization.match(/^Token ([^\s]*)$/);
  if (token) {
    return token[1];
  }

  return null;
};

var getLimit = function (query) {
  return _.toInteger(_.get(query, 'limit', 100));
};

var getEarliestDate = function (query) {
  return _.get(query, 'earliestDate');
};

var getLatestDate = function (query) {
  return _.get(query, 'latestDate');
};

var getStart = function (field, type, query) {
  return _.toInteger(_.get(query, 'start_at', 0));
};

// Converts an AWS datapipline template to the format
// accepted by aws-sdk
var pipelineTemplateConverter = function (arr, fieldName) {
  var newTemplate = [];

  arr.map(function (obj) {
    var newObj = {};
    newObj[fieldName] = [];

    _.mapKeys(obj, function (value, key) {
      if (key === 'id' || key === 'name') {
        newObj[key] = value;
      } else {
        var field = {
          key: key
        };
        if (_.has(value, 'ref')) {
          field.refValue = value.ref;
        } else if (_.isArray(value)) {
          field.stringValue = value[0];
        } else if (_.isString(value)) {
          field.stringValue = value;
        }
        newObj[fieldName].push(field);
      }
    });

    newTemplate.push(newObj);
  });

  return newTemplate;
};

var esQuery = function (query, callback) {
  // Host should be in a format like:
  // search-cluster-name-aaaa00aaaa0aaa0aaaaaaa0aaa.us-east-1.es.amazonaws.com
  var esHost = process.env.ES_HOST;
  var url = `https://${esHost}`;

  // Must have AWS credentials present in environment for this signing function to work
  var esClient = new es.Client({
    host: url,
    connectionClass: awsES,
    amazonES: {
      region: process.env.AWS_REGION || 'us-east-1',
      accessKey: process.env.AWS_ACCESS_KEY_ID,
      secretKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  esClient.search(
    { body: query }
  ).then(res => {
    let results = res.hits.hits.map(document => {
      let item = document._source;
      item._index = document._index;
      delete item['@SequenceNumber'];
      delete item['@timestamp'];
      return item;
    });
    return callback(null, results);
  }).catch(err => {
    return callback(err);
  });
};

module.exports.getToken = getToken;
module.exports.getLimit = getLimit;
module.exports.getStart = getStart;
module.exports.pipelineTemplateConverter = pipelineTemplateConverter;
module.exports.getEarliestDate = getEarliestDate;
module.exports.getLatestDate = getLatestDate;
module.exports.esQuery = esQuery;
