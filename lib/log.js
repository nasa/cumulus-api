'use strict';

import request from 'request';
import util from 'util';
import winston from 'winston';
import { Search } from './es/search';


const CumulusLogger = winston.transports.CumulusLogger = function(options = {}) {
  this.name = options.name || 'cumulus-api';
};

util.inherits(CumulusLogger, winston.Transport);

CumulusLogger.prototype.log = function(level, msg, meta, callback) {
  const host = process.env.SPLUNK_HOST || 'localhost';
  const port = process.env.SPLUNK_PORT || 8089;
  const username = process.env.SPLUNK_USERNAME || 'admin';
  const password = process.env.SPLUNK_PASSWORD || 'password';
  const index = process.env.stackName || 'main';

  const now = new Date();
  const url = `https://${host}:${port}/services/receivers/simple?&index=${index}&source=${this.name}`;
  const body = {
    level: level,
    data: `[${level.toUpperCase()}] ${msg}`,
    meta: meta,
    timestamp: now.toISOString()
  };

  // do not post to splunk if this is a local run
  if (process.env.IS_LOCAL === 'true') {
    return;
  }

  request({
    url: url,
    method: 'POST',
    auth: {
      user: username,
      pass: password
    },
    rejectUnauthorized: false,
    body: JSON.stringify(body)
  }, callback);
};


const EsLogger = winston.transports.EsLogger = function() {};

util.inherits(EsLogger, winston.Transport);

EsLogger.prototype.log = function(level, msg, meta, callback) {
  // do not post to splunk if this is a local run
  if (process.env.IS_LOCAL === 'true') {
    return callback();
  }

  const client = Search.es();

  const now = new Date();
  client.index({
    index: `${process.env.StackName}-${process.env.Stage}-logs`,
    type: level,
    body: {
      level: level,
      data: msg,
      meta: meta,
      timestamp: now.toISOString()
    }
  }, (err) => {
    if (err) {
      console.log(err);
    }
    callback();
  });
};


export default new winston.Logger({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.EsLogger)()
  ]
});

