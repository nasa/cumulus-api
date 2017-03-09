'use strict';

import fs from 'fs';
import os from 'os';
import _ from 'lodash';
import pvl from 'pvl';
import got from 'got';
import { execSync } from 'child_process';
import urljoin from 'url-join';
import { join } from 'path';
import Crawler from 'simplecrawler';
import { syncUrl, downloadS3Files } from 'gitc-common/aws';
import { SQS, S3, invoke } from 'cumulus-common/aws-helpers';
import { Pdr, Provider, Granule, Collection, RecordDoesNotExist } from './models';
import log from './log';

const logDetails = {
  file: 'lib/ingest.js',
  type: 'ingesting',
  source: 'ingest.js'
};


class GranuleIngest {

  constructor(granule) {
    this.files = granule.files;
    this.granule = granule;
    this.granuleId = granule.granuleId;
  }

  async ingest(dispatch = true) {
    try {
      log.info(`Ingesting ${this.granuleId}`, logDetails);
      for (const file of this.files) {
        await this._ingestFile(file);
      }

      // update granule Record
      const g = new Granule();
      const record = await g.ingestCompleted({
        granuleId: this.granuleId
      }, this.granule);

      log.info(`Succesfully ingested ${this.granuleId}`, logDetails);

      // invoke the dispatcher
      if (dispatch) {
        await invoke(process.env.dispatcher, {
          previousStep: 0,
          nextStep: 0,
          granuleRecord: record
        });
      }
    }
    catch (e) {
      console.error(e);
      log.error(`Ingesting ${this.granuleId} failed: ${e.message}`, logDetails);
      const g = new Granule();
      await g.hasFailed({ granuleId: this.granuleId }, e);
    }
  }

  /**
   * Ingest individual files
   * @private
   */
  async _ingestFile(file) {
    // check if the file is already ingested
    const fileExists = await S3.fileExists(
      process.env.internal,
      join('staging', file.filename)
    );

    // proceed only if the file doesn't exist
    if (!fileExists) {
      // download the file
      // we had considered a direct stream from source to S3 but since
      // it doesn't work with FTP connections, we decided to always download
      // and then upload
      const tempFile = await this._download(this.granule.host, file.path, file.filename);

      // run the checksum if there is a checksum value available
      // TODO: add support for md5
      if (file.checksumType && file.checksumType.value.toLowerCase() === 'cksum') {
        await this._cksum(tempFile, file.checksumValue);
        log.info(`Checksum validation passed for ${file.filename}`, logDetails);
      }

      log.info(`Uploading ${file.filename} to S3`, logDetails);

      // upload the file to S3
      await S3.upload(
        process.env.internal,
        join('staging', file.filename),
        fs.createReadStream(tempFile)
      );

      log.info(`${file.filename} uploaded`, logDetails);

      // delete temp file
      fs.unlinkSync(tempFile);
    }
    else {
      log.info(`${file.filename} is already uploaded`, logDetails);
    }
  }

  async _cksum(tempFile, checksumValue) {
    const stdout = execSync(`cksum ${tempFile}`);
    const cksum = stdout.toString().split(' ')[0]

    if (cksum != checksumValue.value) {
      log.error(
        `Checksum verification failed. Original: ${checksumValue.value} Copy: ${cksum}`,
        logDetails
      );
      throw new Error(`Checksum verification failed for ${this.granuleId}`)
    }
  }
}


/**
 * This is a base class for ingesting PDRs
 * It must be mixed with a FTP or HTTP mixing to work
 *
 * The base class includes methods for discovering and
 * parsing PDRs
 *
 * @class
 * @abstract
 */

class PdrIngest {

  constructor(provider) {
    if (this.constructor === PdrIngest) {
      throw new TypeError('Can not construct abstract class.');
    }

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
   * @return {Promise}
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
   * @return {Promise}
   * @public
   */

  async parse(pdr, concurrency = 5) {
    // catching all parse errors here to mark the pdr as failed
    // if any error occured
    try {
      logDetails.pdrName = pdr.name;

      log.info(`${pdr.name} downloaded from S3 to be parsed`, logDetails);
      // first download the PDR. Because the PDRs are supposed to be on S3
      // we don't need to use the HTTP/FTP mixins for download
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

          const granuleFiles = {
            granuleId: null,
            protocol: this.provider.protocol,
            host: this.host,
            pdrName: pdr.name,
            collectionName: null,
            files: []
          };
          for (const spec of specs) {
            const directoryId = spec.get('DIRECTORY_ID').value;
            const fileId = spec.get('FILE_ID').value;
            const checksumType = spec.get('FILE_CKSUM_TYPE');
            const checksumValue = spec.get('FILE_CKSUM_VALUE');

            // TODO: In phase III we have to udpate this to
            // allow handling of PDRs that inculde multiple
            // collections. In the current implementation, we assume
            // there are only one collection per granule
            if (!this.collection) {
              // identify the collection by looking at regex
              await this._getCollection(fileId);
            }

            // this is the content of the message passed to
            // granules queue for download
            granuleFiles.files.push({
              checksumType: checksumType,
              checksumValue: checksumValue,
              path: directoryId,
              filename: fileId,
              url: urljoin(this.host, directoryId, fileId)
            });
          }

          // have to add this here because we don't know collection before the loop
          granuleFiles.collectionName = this.collection.collectionName;

          allGranules.push(granuleFiles);
        }
        await Promise.all(allGranules.map(this._queueForDownload, this));
      }

      // update pdr record
      const p = new Pdr();
      return await p.updateStatus({ pdrName: pdr.name }, 'parsed');
    }
    catch (e) {
      console.error(e);
      await this._setPdrError(pdr.name, e);
    }
  }


  /**
   * Checks whether the granule is already ingested
   * The definition of an ingested granule is if the
   * granule record exists and its status is set to completed
   * @return {Promise}
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
   * @return {Promise}
   * @private
   */

  async _queueForDownload(granule) {
    if (!Array.isArray(granule.files)) {
      throw new Error('files argument must be an array');
    }
    let pdrName;

    const idExtraction = this.collection.granuleDefinition.granuleIdExtraction;
    // extract granuleId
    const granuleId = Granule.getGranuleId(granule.files[0].filename, idExtraction);
    granule.granuleId = granuleId;

    // only ingest if the granule is not ingested
    const isAlreadyIngested = await this._isAlreadyIngested(granuleId);
    if (!isAlreadyIngested) {

      // create granule Record
      // this will override granule records that have a status
      // other than completed
      const g = new Granule();
      const granuleRecord = await Granule.buildRecord(
                                    this.collection.collectionName,
                                    granule.pdrName,
                                    granuleId,
                                    granule.files,
                                    this.collection
                                  );
      await g.create(granuleRecord);

      // queue message
      await SQS.sendMessage(process.env.GranulesQueue, granule);
      log.info(
        `Files for ${granuleId} added to granule queue for ingestion`,
        logDetails
      );

      // update PDR record status
      const p = new Pdr();
      return await p.updateStatus({ pdrName: granule.pdrName }, 'parsed');
    }
  }

  /**
   * Identifies the collection name
   * by running the regex against the first file
   * of a PDR File Group
   * @return {Promise}
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
   * @return {Promise}
   * @private
   */

  async _queuePdr(pdr) {
    await SQS.sendMessage(process.env.PDRsQueue, pdr);
    const meta = Object.assign({}, logDetails, { pdrName: pdr.name });
    log.info(`Added ${pdr.name} to PDR queue`, meta);
  }


  /**
   * Adds a pdr record to PDR table
   * @return {Promise}
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
   * @return {Promise}
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
   * @return {Promise}
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
   * @return {Promise}
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
   * @return {Promise}
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
   * @return {Promise}
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
   * @return {Promise}
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


  /**
   * Downloads the file to disk, difference with sync is that
   * this method involves no uploading to S3
   * @return {Promise}
   * @private
   */
  async _download(host, path, filename) {
    // let's stream to file
    const tempFile = join(os.tmpdir(), filename);
    const file = fs.createWriteStream(tempFile);
    const uri = urljoin(host, path, filename);
    log.info(`Downloading ${uri}`, logDetails);

    const stream = got.stream(uri).pipe(file);

    return new Promise((resolve, reject) => {
      file.on('finish', () => {
        log.info(`Finished downloading ${filename}`, logDetails);
        resolve(tempFile)
      });

      stream.on('error', (e) => reject(e));
    });
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


/**
 * Ingest Granules from a HTTP endpoint.
 * It has one main methods, `ingest`.
 *
 * @class
 */

export class HttpGranuleIngest extends httpMixin(GranuleIngest) {}
