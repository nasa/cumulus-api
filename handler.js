'use strict';

var _ = require('lodash');
var models = require('./src/models');
var utils = require('./src/utils');

module.exports.listDataSets = function(event, context, cb) {

  models.DataSet.scan().exec(function (err, datasets) {
    return cb(err, datasets)
  });
};

module.exports.getDataSet = function(event, context, cb) {
  console.log(event);
  models.DataSet.get({name: event.path.short_name}, function(err, dataset) {
    console.log(dataset)
    if (!dataset)
      err = 'Record was not found';
    return cb(err, dataset)
  });
};

module.exports.postDataSet = function(event, context, cb) {

  // var token = utils.getToken(event.headers);

  console.log(event.headers)
  console.log(_.get(event.headers, 'Token', null))

  if (_.get(event.headers, 'Token', null) === 'thisisatesttoken') {
    var newRecord = new models.DataSet(_.get(event, 'body', {}));
    newRecord.save(function (err) {
      return cb(err, newRecord);
    });

  } else {
    return cb('Invalid Token', null);
  }
};
