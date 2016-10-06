'use strict';

var path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '.env'),
  silent: false
});

var _ = require('lodash');
var auth = require('../src/controllers/auth');

module.exports.signup = function (event, context, cb) {
  return auth.signup(
    _.get(event, 'body.email', null),
    _.get(event, 'body.password', null),
    _.get(event, 'body.invite', null),
    cb
  );
};

module.exports.signin = function (event, context, cb) {
  return auth.signin(
    _.get(event, 'body.username', null),
    _.get(event, 'body.password', null),
    cb
  );
};
