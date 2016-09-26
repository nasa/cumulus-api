var splunk = require('splunk-sdk');

var service = new splunk.Service({
  username: process.env.mySplunkUsername,
  password: process.env.mySplunkPassword,
  host: process.env.mySplunkHost,
  port: process.env.mySplunkPort || '8089'
});

module.exports = service;
