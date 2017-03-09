'use strict';

import log from 'cumulus-common/log';
import { localRun } from 'cumulus-common/local';
import { pollProviders } from './discover';
import { pollPdrQueue } from './parse';
import { pollGranulesQueue } from './download';

/**
 * Handler for starting a SQS poll for granules that has to ingested
 * This function runs pollGranulesQueue indefinitely until cancelled
 *
 * @param {object} event AWS Lambda uses this parameter to
 * pass in event data to the handler
 * @return {undefined}
 */
export function download(event) {
  const concurrency = event.concurrency || 1;
  try {
    pollGranulesQueue(concurrency)
    .then((r) => console.log(r))
    .catch((e) => log.error(e, e.stack, 'ingestGranulesHandler'));
  }
  catch (e) {
    console.log(e, e.stack);
  }
}


/**
 * Handler for starting a SQS poll for PDRs
 * This function runs pollPdrQueue indefinitely until cancelled
 *
 * @param {object} event AWS Lambda uses this parameter to
 * pass in event data to the handler
 * @return {undefined}
 */
export function parse(event) {
  const numOfMessage = event.numOfMessage || 1;
  const visibilityTimeout = event.visibilityTimeout || 20;

  pollPdrQueue(numOfMessage, visibilityTimeout);
}


/**
 * Handler for discovering and syncing latest PDRs.
 * The handler is invoked by a Lambda function.
 *
 * The event object (payload) must include the endpoint for the
 * function to check
 * @param {object} event AWS Lambda uses this parameter to
 * pass in event data to the handler
 * @param {object} context
 * {@link http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html|AWS Lambda's context object}
 * @param {function} cb {@link http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html#nodejs-prog-model-handler-callback|AWS Lambda's callback}
 * @return {undefined}
 */
export function discover(event) {
  // use callback with promise
  const frequency = event.frequency || 60;
  pollProviders(frequency);
}

export function handler(event, context, cb) {
  const registered = {
    discover,
    parse,
    download
  };

  if (registered.hasOwnProperty(event.action)) {
    registered[event.action](event);
  }
  else {
    cb(`Action is not supported. Supported actions are ${Object.keys(registered)}`);
  }
}


// for local run: babel-node lambdas/pdr/index.js local discover
// for remote run: babel-node lambdas/ingest/index.js remote discover
localRun(() => {
  handler(
    { action: process.argv[3] },
    null,
    (e, d) => console.log(e, d)
  );
});
