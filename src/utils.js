var _ = require('lodash');


// returns token if present in the Authorization section of header
var getToken = function(header) {
  var has_token = new RegExp(/^Token ([^\s]*)$/)
  var authorization = _.get(header, 'Authorization', null)
  var token = authorization.match(/^Token ([^\s]*)$/);
  if (token) {
      return token[1]
  }

  return null
}

var getLimit = function(query) {
  return _.toInteger(_.get(query, 'limit', 100));
}

var startAt = function(field, type, query) {
  var start = _.get(query, 'start_at', null)

  var obj = {}
  obj[field] = {}
  obj[field][type] = start

  if (start) {
    return obj;
  } else {
    return null
  }
}


// Converts an AWS datapipline template to the format
// accepted by aws-sdk
var pipelineTemplateConverter = function (arr, fieldName) {
  var newTemplate = []

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
        }
        else if (_.isString(value)) {
          field.stringValue = value;
        }
        newObj[fieldName].push(field)
      }
    });

    newTemplate.push(newObj);
  });

  return newTemplate
};

module.exports.getToken = getToken;
module.exports.getLimit = getLimit;
module.exports.startAt = startAt;
module.exports.pipelineTemplateConverter = pipelineTemplateConverter;
