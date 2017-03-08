'use strict';

import _ from 'lodash';
import urljoin from 'url-join';
import { join } from 'path';
import Crawler from 'simplecrawler';
import { syncUrl } from 'gitc-common/aws';
import { SQS } from 'cumulus-common/aws-helpers';
import { Pdr, Provider } from './models';
import log from './log';

const logDetails = {
  file: 'lib/ingest.js',
  type: 'ingesting',
  source: 'ingest.js'
};

class PdrIngest {

  constructor() {
    this.bucket = process.env.internal;
    this.key = 'staging';
    this.pdrs = [];
    this.newPdrs = [];
  }

  async queuePdr(pdr) {
    await SQS.sendMessage(process.env.PDRsQueue, pdr);
    const meta = Object.assign({}, logDetails, { pdrName: pdr.name });
    log.info(`Added ${pdr.name} to PDR queue`, meta);
  }

  async addRecord(pdr) {
    const pdrRecord = Pdr.buildRecord(pdr.name, pdr.provider, pdr.url);
    pdrRecord.address = pdr.s3Uri;

    const p = new Pdr();
    await p.create(pdrRecord);
    const meta = Object.assign({}, logDetails, { pdrName: pdr.name });
    log.info(`Saved ${pdr.name} to PDRsTable`, meta);
  }

  async uploadAndQueue() {
    for (const pdr of this.newPdrs) {
      // upload pdr to S3 and
      pdr.s3Uri = await this.sync(pdr.url, this.bucket, this.key, pdr.name);

      // queue the PDR
      await this.queuePdr(pdr);

      // add the pdr record
      await this.addRecord(pdr);
    }
  }

  async findNewPdrs(chunkSize = 60) {
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

  async providerError(err) {
    // make provider in-active
    const p = new Provider();
    await p.update(
      { name: this.provider },
      { status: 'failed', isActive: false, error: err.message }
    );

    // log the error
    log.error(`Ingesting from the provider failed: ${err.message}`, logDetails);
  }

  async ingest() {
    await this.discover();
    await this.findNewPdrs();
    await this.uploadAndQueue();
  }
}

const httpMixin = (superclass) => class extends superclass {

  constructor(host, path, provider) {
    super();
    this.host = host;
    this.path = path;
    this.provider = provider;
    this.endpoint = urljoin(host, path);
    logDetails.provider = provider;
  }

  discover() {
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
            this.pdrs.push({
              name: name,
              provider: this.provider,
              url: urljoin(this.endpoint, name)
            });
          }
        }

        log.info(`${this.pdrs.length} PDR(s) were found`, logDetails);
        return resolve(this.pdrs);
      });

      c.on('fetchtimeout', (err) => reject(err));
      c.on('fetcherror', (err) => reject(err));

      c.on('fetch404', (err) => {
        const e = {
          message: `Received a 404 error from ${this.endpoint}`,
          details: err
        };

        // flag the provider
        this.providerError(e)
          .then(() => reject(e))
          .catch((error) => reject(error));
      });

      c.start();
    });
  }

  async sync(url, bucket, key, filename) {
    await syncUrl(url, bucket, join(key, filename));
    log.info(
      `Uploaded ${filename} to S3`,
      Object.assign({}, logDetails, { pdrName: filename })
    );

    return urljoin('s3://', bucket, key, filename);
  }
};

const ftpMixing = (superclass) => class extends superclass {};


export class PdrHttpIngest extends httpMixin(PdrIngest) {}
