var _ = require('lodash');


// returns token if present in the Authorization section of header
module.exports.getToken = function(header) {
  var has_token = new RegExp(/^Token ([^\s]*)$/)
  var authorization = _.get(header, 'Authorization', null)
  var token = authorization.match(/^Token ([^\s]*)$/);
  if (token) {
      return token[1]
  }

  return null
}

module.exports.getLimit = function(query) {
  return _.toInteger(_.get(query, 'limit', 100));
}

module.exports.startAt = function(field, type, query) {
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
