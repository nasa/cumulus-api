var splunk = require('splunk-sdk');

var service = new splunk.Service({
  username: process.env.SPLUNK_USERNAME,
  password: process.env.SPLUNK_PASSWORD,
  host: process.env.SPLUNK_HOST,
  port: process.env.SPLUNK_PORT || '8089'
});

module.exports = service;
