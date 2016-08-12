'use strict';

var models = require('./src/models');

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



  models.DataSet.get({name: event.path.short_name}, function(err, dataset) {
    console.log(dataset)
    if (!dataset)
      err = 'Record was not found';
    return cb(err, dataset)
  });
};
