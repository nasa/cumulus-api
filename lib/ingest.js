'use strict';

import fs from 'fs';
import _ from 'lodash';
import pvl from 'pvl';
import urljoin from 'url-join';
import { join } from 'path';
import Crawler from 'simplecrawler';
import { syncUrl, downloadS3Files } from 'gitc-common/aws';
import { SQS } from 'cumulus-common/aws-helpers';
import { Pdr, Provider, Granule, Collection, RecordDoesNotExist } from './models';
import log from './log';

const logDetails = {
  file: 'lib/ingest.js',
  type: 'ingesting',
  source: 'ingest.js'
};

class PdrIngest {

  constructor(provider) {
    this.bucket = process.env.internal;
    this.key = 'staging';
    this.pdrs = []; // list of all pdrs discovered
    this.collection = null; // holds the collection associated with the PDR
    this.newPdrs = []; // list of pdrs to are not ingested
    this.host = provider.host;
    this.path = provider.path;
    this.provider = provider;
    this.endpoint = urljoin(this.host, this.path);
    logDetails.provider = provider.name;
  }

  /**
   * discover PDRs from an endpoint
   * @public
   */

  async discover() {
    await this._list();
    await this._findNewPdrs();
    await this._uploadAndQueue();

    // update provider's lastTimeIngestedAt
    const provider = new Provider();
    await provider.update({ name: this.provider.name },
                          { lastTimeIngestedAt: Date.now() });
  }

  /**
   * This async method parse a PDR stored on S3 and download all the files
   * in the PDR to a staging S3 bucket. The return is void.
   *
   * The function first download the PDR file from an ingest location to local disk.
   * It then reads the file content and parse it.
   *
   * The function loops through the parsed PDR and identifies granules and associated files
   * in each object. The files are added to a separate queue for download and new granule records
   * are added to the GranuleTable on DynamoDB.
   *
   * @param {object} pdr the PDR on s3. The PDR must be on cumulus-internal/pdrs folder
   * @return {undefined}
   * @public
   */

  async parse(pdr, concurrency = 5) {
    // catching all parse errors here to mark the pdr as failed
    // if any error occured
    try {
      logDetails.pdrName = pdr.name;

      log.info(`${pdr.name} downloaded from S3 to be parsed`, logDetails);
      // first download the PDR
      await downloadS3Files(
        [{ Bucket: this.bucket, Key: join('pdrs', pdr.name) }],
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

      // Get all the file groups
      const fileGroups = parsed.objects('FILE_GROUP');

      const approximateFileCount = (fileGroups.length *
                                    fileGroups[0].objects('FILE_SPEC').length);
      const granuleCount = fileGroups.length;

      // each group represents a Granule record.
      // After adding all the files in the group to the Queue
      // we create the granule record (moment of inception)
      log.info(`There are ${granuleCount} granules in ${pdr.name}`, logDetails);
      log.info(
        `There are approximately ${approximateFileCount} files in ${pdr.name}`,
        logDetails
      );


      //
      // Iterate over the PDR
      //
      const chunks = _.chunk(fileGroups, concurrency);

      for (const fileGroup of chunks) {
        const allGranules = [];
        for (const group of fileGroup) {
          // get all the file specs in each group
          const specs = group.objects('FILE_SPEC');

          if (specs.length === 0) {
            continue;
          }

          const granuleFiles = [];
          for (const spec of specs) {
            const directoryId = spec.get('DIRECTORY_ID').value;
            const fileId = spec.get('FILE_ID').value;

            if (!this.collection) {
              // identify the collection by looking at regex
              await this._getCollection(fileId);
            }

            // this is the content of the message passed to
            // granules queue for download
            granuleFiles.push({
              host: this.host,
              path: directoryId,
              filename: fileId,
              url: urljoin(this.host, directoryId, fileId),
              pdrName: pdr.name,
              collectionName: this.collection.collectionName
            });
          }

          allGranules.push(granuleFiles);
        }
        await Promise.all(allGranules.map(this._queueForDownload, this));
      }

      // update pdr record
      const p = new Pdr();
      return await p.updateStatus({ pdrName: pdr.name }, 'parsed');
    }
    catch (e) {
      await this._setPdrError(pdr.name, e);
    }
  }


  /**
   * Checks whether the granule is already ingested
   * The definition of an ingested granule is if the
   * granule record exists and its status is set to completed
   * @private
   */

  async _isAlreadyIngested(granuleId) {
    //
    // check if there is a granule record already created
    //
    let granuleRecord;
    const g = new Granule();
    try {
      granuleRecord = await g.get({
        granuleId: granuleId
      });

      log.info(`A record for ${granuleId} exists`, logDetails);

      //
      // check if the record is already ingested
      //
      if (granuleRecord.status === 'completed') {
        log.info(`${granuleId} is processed. Skipping!`, logDetails);
        return true;
      }
    }
    catch (e) {
      if (e instanceof RecordDoesNotExist) {
        log.info(`New record for ${granuleId} will be added`, logDetails);
        return false;
      }
      log.error(e, logDetails);
      throw e;
    }
  }

  /**
   * creates the Granule record and queue the file(s)
   * for download
   * @private
   */

  async _queueForDownload(files) {
    if (!Array.isArray(files)) {
      throw new Error('files argument must be an array');
    }
    let pdrName;

    const idExtraction = this.collection.granuleDefinition.granuleIdExtraction;
    // extract granuleId
    const granuleId = Granule.getGranuleId(files[0].filename, idExtraction);

    // only ingest if the granule is not ingested
    const isAlreadyIngested = await this._isAlreadyIngested(granuleId);
    if (!isAlreadyIngested) {
      const granuleFiles = [];
      for (const file of files) {
        file.granuleId = granuleId;
        pdrName = file.pdrName;
      }

      // create granule Record
      // this will override granule records that have a status
      // other than completed
      const g = new Granule();
      const granuleRecord = await Granule.buildRecord(
                                    this.collection.collectionName,
                                    pdrName,
                                    granuleId,
                                    files,
                                    this.collection
                                  );
      await g.create(granuleRecord);

      // queue message
      await SQS.sendMessage(process.env.GranulesQueue, granuleFiles);
      log.info(
        `Files for ${granuleId} added to granule queue for ingestion`,
        logDetails
      );

      // update PDR record status
      const p = new Pdr();
      return await p.updateStatus({ pdrName: pdrName }, 'parsed');
    }
  }

  /**
   * Identifies the collection name
   * by running the regex against the first file
   * of a PDR File Group
   * @private
   */

  async _getCollection(file, pdrName) {
    const regex = this.provider.regex;

    for (const key in regex) { // eslint-disable-line
      const test = new RegExp(regex[key]);
      if (file.match(test)) {
        const c = new Collection();
        this.collection = await c.get({ collectionName: key });
        return;
      }
    }

    // if no collection matched the file raise Error
    const errorMsg = `${file} did not match any of the collections`;
    await this._setPdrError(pdrName, errorMsg);
    throw new Error(errorMsg);
  }

  /**
   * Adds a message to PDRs queue
   * @private
   */

  async _queuePdr(pdr) {
    await SQS.sendMessage(process.env.PDRsQueue, pdr);
    const meta = Object.assign({}, logDetails, { pdrName: pdr.name });
    log.info(`Added ${pdr.name} to PDR queue`, meta);
  }


  /**
   * Adds a pdr record to PDR table
   * @private
   */

  async _addRecord(pdr, failed = false, error = null) {
    const pdrRecord = Pdr.buildRecord(pdr.name, pdr.provider.name, pdr.url);
    pdrRecord.address = pdr.s3Uri;

    const p = new Pdr();

    if (failed) {
      pdrRecord.status = 'failed';
      pdrRecord.isActive = false;
      pdrRecord.error = error;
    }

    await p.create(pdrRecord);
    const meta = Object.assign({}, logDetails, { pdrName: pdr.name });
    log.info(`Saved ${pdr.name} to PDRsTable`, meta);
  }

  /**
   * uploads the PDR to s3 and calls _addRecord method
   * @private
   */

  async _uploadAndQueue() {
    for (const pdr of this.newPdrs) {
      const meta = Object.assign({}, logDetails, { pdrName: pdr.name });
      let failed = false;
      let error;

      // upload pdr to S3 and
      try {
        pdr.s3Uri = await this._sync(pdr.url, this.bucket, this.key, pdr.name);
        // queue the PDR
        await this._queuePdr(pdr);
      }
      catch (e) {
        // if upload failed, mark the pdr as failed
        failed = true;
        error = 'PDR file was not reachable';
        log.error(`Download of ${pdr.name} failed. The file was unreachable`, meta);
      }
      // add the pdr record
      await this._addRecord(pdr, failed, error);
    }
  }

  /**
   * Determines which of the discovered PDRs are new
   * and has to be parsed
   * @private
   */

  async _findNewPdrs(chunkSize = 60) {
    // divide pdr list to chunks of 60
    // to avoid DynamoDB batchGet limit of 100
    const chunks = _.chunk(this.pdrs, chunkSize);

    let newPdrs = [];
    log.info('Determining which of the PDRs are new', logDetails);
    for (const chunk of chunks) {
      const items = chunk.map(p => ({ pdrName: p.name }));
      const pdr = new Pdr();

      const response = await pdr.batchGet(items, ['pdrName']);

      const all = items.map(p => p.pdrName);
      const existing = response.Responses[process.env.PDRsTable].map(p => p.pdrName);

      const nw = _.difference(all, existing);
      newPdrs = newPdrs.concat(nw);
    }

    log.info(`${newPdrs.length} of PDR(s) are new`, logDetails);
    this.newPdrs = this.pdrs.filter(p => {
      if (newPdrs.indexOf(p.name) !== -1) return true;
      return false;
    });
    return this.newPdrs;
  }


  /**
   * Marks provider record as failed and adds error message
   * @private
   */

  async _setProviderError(err) {
    // make provider in-active
    const p = new Provider();
    await p.hasFailed({ name: this.provider.name }, err.message);

    // log the error
    log.error(`Ingesting from the provider failed: ${err.message}`, logDetails);
  }

  /**
   * Marks pdr record as failed and adds error message
   * @private
   */

  async _setPdrError(pdrName, err) {
    // make provider in-active
    const p = new Pdr();
    await p.hasFailed({ pdrName: pdrName }, err.message);

    // log the error
    log.error(`Parsing the PDR failed: ${err.message}`, logDetails);
  }

  /**
   * Construct a PDR message for the parsing Queue
   * @private
   */

  _pdrMessage(pdrName) {
    return {
      name: pdrName,
      provider: this.provider,
      url: urljoin(this.endpoint, pdrName),
      s3Uri: null
    };
  }
}

const httpMixin = (superclass) => class extends superclass {


  /**
   * List all PDR files from a given endpoint
   * @private
   */

  _list() {
    const pattern = /<a href="(.*PDR)">/;
    const c = new Crawler(this.endpoint);

    log.info(`Checking ${this.endpoint} for PDRs`, logDetails);

    c.timeout = 2000;
    c.interval = 0;
    c.maxConcurrency = 10;
    c.respectRobotsTxt = false;
    c.userAgent = 'Cumulus';
    c.maxDepth = 1;

    return new Promise((resolve, reject) => {
      c.on('fetchcomplete', (queueItem, responseBuffer) => {
        log.info(`Received the list of PDRs from ${this.endpoint}`, logDetails);
        const lines = responseBuffer.toString().trim().split('\n');
        for (const line of lines) {
          const split = line.trim().split(pattern);
          if (split.length === 3) {
            const name = split[1];
            this.pdrs.push(this._pdrMessage(name));
          }
        }

        log.info(`${this.pdrs.length} PDR(s) were found`, logDetails);
        return resolve(this.pdrs);
      });

      c.on('fetchtimeout', (err) => reject(err));
      c.on('fetcherror', (err) => reject(err));

      c.on('fetch404', (err) => {
        const e = {
          message: `Received a 404 error from ${this.endpoint}. Check your endpoint!`,
          details: err
        };

        // flag the provider
        this._setProviderError(e)
          .then(() => reject(e))
          .catch((error) => reject(error));
      });

      c.start();
    });
  }

  /**
   * Downloads a given url and upload to a given S3 location
   * @private
   */

  async _sync(url, bucket, key, filename) {
    await syncUrl(url, bucket, join(key, filename));
    log.info(
      `Uploaded ${filename} to S3`,
      Object.assign({}, logDetails, { pdrName: filename })
    );

    return urljoin('s3://', bucket, key, filename);
  }
};

const ftpMixing = (superclass) => class extends superclass {};


/**
 * Ingest PDRs from a HTTP endpoint.
 * It has two main methods, `discover` and `parse`.
 * `discover` finds new PDRs from a given endpoint
 * downloads, and queue them for parsing.
 * `parse` makes sense of each PDR and queue granules
 * for download.
 *
 * @class
 */

export class PdrHttpIngest extends httpMixin(PdrIngest) {}
