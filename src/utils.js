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
