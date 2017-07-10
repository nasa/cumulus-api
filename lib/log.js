'use strict';

import util from 'util';
import winston from 'winston';
import { errorify } from './utils';
import { Search } from './es/search';

const EsLogger = function() {};

util.inherits(EsLogger, winston.Transport);

let client;

// the whole purpose of this function is
// to cache elasticsearch instance and make our life easier
function postToEs(func) {
  if (client) {
    func(client);
  }
  else {
    Search.es().then((esClient) => {
      client = esClient;
      func(client);
    });
  }
}


EsLogger.prototype.log = function(level, msg, meta, callback) {
  // do not post to splunk if this is a local run
  return callback();
  if (process.env.IS_LOCAL === 'true' || process.env.TEST_MODE === 'true') {
    return callback();
  }

  postToEs((esClient) => {
    const now = new Date();

    esClient.index({
      index: `${process.env.StackName}-${process.env.Stage}-logs`,
      type: level,
      body: {
        level: level,
        data: errorify(msg),
        meta: meta,
        timestamp: now.toISOString()
      }
    }, (err) => {
      if (err) {
        console.log(err);
      }
      callback();
    });
  });
};

winston.transports.EsLogger = EsLogger;

export default new winston.Logger({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.EsLogger)()
  ]
});

