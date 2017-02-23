'use strict';

import fs from 'fs';
import pvl from 'pvl';
import _ from 'lodash';
import url from 'url';
import { SQS } from 'cumulus-common/aws-helpers';
import log from 'cumulus-common/log';
import { Granule, Collection, Pdr, RecordDoesNotExist } from 'cumulus-common/models';
import { downloadS3Files } from 'gitc-common/aws';


/**
 * This async function parse a PDR stored on S3 and download all the files
 * in the PDR to a staging S3 bucket. The return is void.
 *
 * The function first download the PDR file from an ingest location to local disk.
 * It thn reads the file content and parse it.
 *
 * The function loops through the parsed PDR and identifies granules and associated files
 * in each object. The files are added to a separate queue for download and new granule records
 * are added to the GranuleTable on DynamoDB.
 *
 * @param {pdrObject} pdr the PDR on s3. The PDR must be on cumulus-internal/pdrs folder
 * @return {undefined}
 */
export async function parsePdr(pdr, concurrency = 5) {
  try {
    // validate the argument
    if (!(_.has(pdr, 'name') && _.has(pdr, 'collectionName'))) {
      throw new Error('The argument must have name and collectionName keys');
    }

    log.info(`${pdr.name} downloaded from S3 to be parsed`, pdr.collectionName);
    // first download the PDR
    await downloadS3Files(
      [{ Bucket: process.env.internal, Key: `pdrs/${pdr.name}` }],
      '.'
    );

    // then read the file and and pass it to parser
    const pdrFile = fs.readFileSync(pdr.name);
    let parsed = pvl.pvlToJS(pdrFile.toString());

    // check if the PDR has groups
    // if so, get the objects inside the first group
    // TODO: handle cases where there are more than one group
    const groups = parsed.groups();
    if (groups.length > 0) {
      parsed = groups[0];
    }

    // grab the collection
    const c = new Collection();
    const collectionRecord = await c.get({ collectionName: pdr.collectionName });

    // Get all the file groups
    const fileGroups = parsed.objects('FILE_GROUP');

    const promiseList = [];
    let counter = 0;
    let total = 0;

    const conc = (func) => {
      counter += 1;
      return promiseList.push(func());
    };

    const approximateFileCount = fileGroups.length * fileGroups[0].objects('FILE_SPEC').length;
    const granuleCount = fileGroups.length;

    // each group represents a Granule record.
    // After adding all the files in the group to the Queue
    // we create the granule record (moment of inception)
    log.info(`There are ${granuleCount} granules in ${pdr.name}`, pdr.collectionName);
    log.info(
      `There are approximately ${approximateFileCount} files in ${pdr.name}`,
      pdr.collectionName
    );

    //
    // Iterate over the PDR
    //
    for (const group of fileGroups) {
      // get all the file specs in each group
      const specs = group.objects('FILE_SPEC');

      if (specs.length === 0) {
        continue;
      }

      // Find the granuleId
      // NOTE: In case of Aster, the filenames don't have the granuleId
      // For Aster, we temporarily use the granuleId in the XAR_ENTRY
      // section of the PDR
      const granuleId = Granule.getGranuleId(
        specs[0].get('FILE_ID').value,
        collectionRecord.granuleDefinition.granuleIdExtraction
      );

      //
      // check if there is a granule record already created
      //
      let granuleRecordExists = false;
      let granuleRecord;
      const g = new Granule();
      try {
        granuleRecord = await g.get({
          granuleId: granuleId,
          collectionName: pdr.collectionName
        });

        log.info(`A record for ${granuleId} exists`, pdr.name, pdr.collectionName);

        //
        // check if the record is already ingested
        //
        if (granuleRecord.status === 'completed') {
          log.info(`${granuleId} is processed. Skipping!`, pdr.name, pdr.collectionName);
          continue;
        }

        granuleRecordExists = true;
      }
      catch (e) {
        if (e instanceof RecordDoesNotExist) {
          log.info(`New record for ${granuleId} will be added`, pdr.name, pdr.collectionName);
        }
        else {
          log.error(e, pdr.name, pdr.collectionName);
        }
      }

      const granuleFiles = [];

      //
      // Iterate over files
      //
      for (const spec of specs) {
        const directoryId = spec.get('DIRECTORY_ID').value;
        const fileId = spec.get('FILE_ID').value;
        const fileUrl = url.resolve('https://e4ftl01.cr.usgs.gov:40521/', `${directoryId}/${fileId}`);

        const granuleFile = {
          file: fileUrl,
          name: fileId,
          granuleId: granuleId,
          collectionName: pdr.collectionName,
          concurrency: pdr.concurrency || 1,
          bucket: process.env.internal,
          type: 'staging'
        };

        // list of files for Granule class
        granuleFiles.push(granuleFile);
      }

      // build the granule record and add it to the database
      if (!granuleRecordExists) {
        conc(async () => {
          granuleRecord = await Granule.buildRecord(
            pdr.collectionName,
            granuleId,
            granuleFiles,
            collectionRecord
          );

          granuleRecord.status = 'ingesting';
          granuleRecord.ingestStarted = Date.now();
          await g.create(granuleRecord);

          // add the granule to the PDR record
          const p = new Pdr();
          await p.addGranule(pdr.name, granuleId, false);
          log.info(`Added a new granule: ${granuleId}`, pdr.name, pdr.collectionName);
        });
      }

      // add the files to the queue to be processaed
      conc(async () => {
        await SQS.sendMessage(process.env.GranulesQueue, granuleFiles);
        log.info(
          `Files for ${granuleId} added to granule queue for ingestion`,
          granuleId,
          pdr.name,
          pdr.collectionName
        );
      });

      total += 1;
      if (counter > concurrency || total === granuleCount) {
        counter = 0;
        log.info('Waiting to for the concurrent tasks to compelte', pdr.name, pdr.collectionName);
        await Promise.all(promiseList);
      }
    }

    return true;
  }
  catch (e) {
    log.error(e.message, e.stack, pdr.name, pdr.collectionName);
    return false;
  }
}


/**
 * Polls a SQS queue for PDRs that have to be parsed.
 * The function is recursive and calls itself until terminated
 *
 * It receives the message(s) from PDRsQueue and send each message to `parsePdr` for parsing.
 * After successful execuation of `parsePdr`, the function deletes the message from the queue
 * and moves to the next message.
 *
 * @param {number} [messageNum=1] Number of messages to be retrieved from the queue
 * @param {number} [visibilityTimeout=20] How long the message is removed from the queue
 */
export async function pollPdrQueue(messageNum = 1, visibilityTimeout = 20, concurrency = 5) {
  try {
    // receive a message
    const messages = await SQS.receiveMessage(
      process.env.PDRsQueue,
      messageNum,
      visibilityTimeout
    );


    // get message body
    if (messages.length > 0) {
      for (const message of messages) {
        const pdr = message.Body;
        const receiptHandle = message.ReceiptHandle;

        log.info(`Parsing ${pdr.name}`, pdr.collectionName);

        const parsed = await parsePdr(pdr, concurrency);

        // detele message if parse successful
        if (parsed) {
          log.info(`deleting ${pdr.name} from the Queue`, pdr.collectionName);
          await SQS.deleteMessage(process.env.PDRsQueue, receiptHandle);
        }
        else {
          log.error(`Parsing failed for ${pdr.name}`, pdr.collectionName);
        }
      }
    }
    else {
      log.debug('No new messages in the PDR queue');
    }
  }
  catch (e) {
    log.error(e, e.stack, 'pollPdrQueue');
  }
  finally {
    // make the function recursive
    pollPdrQueue();
  }
}


/**
 * @typedef {Object} pdrObject
 * @property {string} name pdr name
 * @property {string} url pdr url
 */
