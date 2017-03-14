'use strict';

import AWS from 'aws-sdk';
import log from 'cumulus-common/log';
import { SQS, S3 } from 'cumulus-common/aws-helpers';
import { localRun } from 'cumulus-common/local';
import { sleep } from 'cumulus-common/utils';

const logDetails = {
  file: 'lambdas/runner/index.js',
  type: 'processing',
  source: 'runner'
};

export async function pollQueue(messageNum = 1, visibilityTimeout = 100, wait = 3) {
  try {
    while (true) {
      // poll queue for messages
      const messages = await SQS.receiveMessage(
        process.env.ProcessingQueue,
        messageNum,
        visibilityTimeout
      );

      for (const message of messages) {
        const payload = message.Body;
        const granuleId = payload.granuleRecord.granuleId;
        const receiptHandle = message.ReceiptHandle;
        const image = payload.granuleRecord.recipe.processStep.config.image;
        logDetails.granuleId = granuleId;
        logDetails.collectionName = payload.granuleRecord.collectionName;

        log.info('Recieved message from SQS', logDetails);

        // write payload to s3
        const payloadName = `${granuleId}-${Date.now()}.json`;

        // update process start time
        payload.granuleRecord.timeline.processStep.startedAt = Date.now();

        await S3.put(process.env.internal, `payloads/${payloadName}`, JSON.stringify(payload));
        const payloadUri = `s3://${process.env.internal}/payloads/${payloadName}`;
        log.info(`Pushed payload to S3 ${payloadUri}`, logDetails);

        // launch ecs task
        const ecs = new AWS.ECS();

        // construct task definition
        const taskDefinition = `${process.env.StackName}-${process.env.Stage}-${image}`;

        const params = {
          cluster: process.env.CumulusCluster,
          taskDefinition: taskDefinition,
          overrides: {
            containerOverrides: [
              {
                name: granuleId,
                command: [
                  'recipe',
                  payloadUri,
                  '--dispatcher',
                  process.env.dispatcher,
                  '--sqs',
                  receiptHandle
                ]
              }
            ]
          },
          startedBy: granuleId
        };

        log.info('Attempting to register the task with ECS', logDetails);
        // keep pushing the task until it is registered with ECS
        let response;
        while (true) {
          response = await ecs.runTask(params).promise();
          if (response.tasks.length > 0) {
            log.info(response.tasks, logDetails);
            log.info(`Task registered: ${response.tasks[0].taskArn}`, logDetails);
            break;
          }
          else {
            log.info(
              `Task did not register. Trying again in ${wait} seconds`,
              response,
              logDetails
            );

            // wait for 3 seconds
            sleep(wait * 1000);
          }
        }

        // deleting the message
        await SQS.deleteMessage(process.env.ProcessingQueue, receiptHandle);
        log.info('Message deleted', logDetails);
      }
    }
  }
  catch (e) {
    log.error(e, e.stack, logDetails);
  }
  finally {
    // rerun the function
    await pollQueue(messageNum, visibilityTimeout, wait);
  }
}

export function handler(event, context, cb) {
  pollQueue().then(r => cb(null, r)).catch(e => cb(e));
}

localRun(() => {
  process.env.CumulusCluster = 'cumulus-api-test2-CumulusECSCluster-YOFUX7L4ZQDR';
  process.env.TaskDefinition = 'cumulus-api-test2-AsterProcessingTaskDefinition-1KXHC9IXBCMYF:1';
  handler({}, {}, {});
  //pollQueue().then(r => console.log(r)).catch(e => console.log(e));
});

