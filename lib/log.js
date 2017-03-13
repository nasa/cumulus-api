'use strict';

import util from 'util';
import winston from 'winston';
import { Search } from './es/search';

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

