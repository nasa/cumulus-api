'use strict';

var path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '.env'),
  silent: false
});
var triggers = require('../src/triggers');

module.exports.trigger = function (event, context, cb) {
  triggers.trigger(event.dataset, cb);
};
