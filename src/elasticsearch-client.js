'use strict';

var es = require('elasticsearch');
var awsES = require('http-aws-es');

// Host should be in a format like:
// search-cluster-name-aaaa00aaaa0aaa0aaaaaaa0aaa.us-east-1.es.amazonaws.com
var esHost = process.env.ES_HOST;
var url = `https://${esHost}`;

// Must have AWS credentials present in environment for this signing function to work

if (esHost === 'localhost') {
  module.exports = new es.Client({});
} else {
  module.exports = new es.Client({
    host: url,
    connectionClass: awsES,
    amazonES: {
      region: process.env.AWS_REGION || 'us-east-1',
      accessKey: process.env.AWS_ACCESS_KEY_ID,
      secretKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
}
