'use strict';

var collections = require('../src/controllers/collections');

module.exports.listCollections = function (event, context, cb) {
  collections.listDataSets(event, cb);
};

module.exports.getCollection = function (event, context, cb) {
  collections.getDataSet(event, cb);
};

module.exports.postCollection = function (event, context, cb) {
  collections.postDataSet(event, cb);
};
