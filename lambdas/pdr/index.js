'use strict';

import log from 'cumulus-common/log';
import { localRun } from 'cumulus-common/local';
import { pdrHandler } from './discover';
import { pollPdrQueue, parsePdr } from './parse';
import { pollGranulesQueue } from './download';

/**
 * Handler for starting a SQS poll for granules that has to ingested
 * This function runs pollGranulesQueue indefinitely until cancelled
 *
 * @param {object} event AWS Lambda uses this parameter to
 * pass in event data to the handler
 * @return {undefined}
 */
export function ingestGranulesHandler(event) {
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
export function parsePdrsHandler(event) {
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
export function discoverPdrHandler(event, context, cb = () => {}) {
  // use callback with promise
  pdrHandler(event).then(r => cb(null, r)).catch((err) => {
    log.info(err, JSON.stringify(event));
    cb(err);
  });
}


// for local run: babel-node lambdas/pdr/index.js local
localRun(() => {
  //discoverPdrHandler({ collectionName: 'AST_L1A__version__003' }, null, (d) => console.log(d));

  pollPdrQueue(1, 100, 15);

  //ingestGranulesHandler({
    //concurrency: 3
  //});
  //pollGranulesQueue(3);
  //

  //parsePdr({
    //name: 'PDN.cecc72bd-238d-4a8a-86df-d2306c39f7cb.PDR',
    ////name: 'PDN.ID1611071200.PDR',
    //collectionName: 'MCD43A1.006',
  //});

});
