'use strict';

import moment from 'moment';
import log from 'cumulus-common/log';
import { localRun } from 'cumulus-common/local';
import { Search } from 'cumulus-common/es/search';
import { Granule, Pdr, Resource, Collection } from 'cumulus-common/models';
import { Stats } from 'cumulus-common/stats';

const logDetails = {
  file: 'lambdas/jobs/index.js',
  type: 'backgroundJobs',
  source: 'jobs'
};

/**
 * markStaleGranulesFailed
 *
 * @param {number} timeElapsed=15
 * @param {string} timeUnit='minute'
 */

async function markStaleGranulesFailed(timeElapsed = 200, timeUnit = 'minute') {
  const g = new Granule();

  const params = {
    queryStringParameters: {
      fields: 'granuleId',
      status__in: 'processing,archiving,cmr',
      updatedAt__to: moment().subtract(timeElapsed, timeUnit).unix() * 1000,
      limit: 100
    }
  };

  const search = new Search(params, process.env.GranulesTable);
  const r = await search.query();

  const errMsg = ('did not complete ' +
    `or fail for at least ${timeElapsed} ${timeUnit}s`);

  if (r.meta.count) {
    log.info(`${r.meta.count} granules ${errMsg}. Marking them as failed`);

    await Promise.all(r.results.map(item => g.hasFailed(
      { granuleId: item.granuleId }, `The granule ${errMsg}`
    )));
  }
  else {
    console.log('No stale granules found');
  }
}

async function consolidateAllPdrStats() {
  const params = {
    queryStringParameters: {
      fields: 'pdrName',
      status__in: 'failed,completed',
      limit: 10000
    }
  };

  const search = new Search(params, process.env.PDRsTable);
  const r = await search.query();

  const p = new Pdr();

  for (const result of r.results) {
    const stats = await search.granulesStats('pdrName', result.pdrName);
    const updateObj = {
      granules: stats.granules,
      granulesStatus: stats.granulesStatus,
      progress: stats.progress,
      averageDuration: stats.averageDuration
    };

    console.log(`Updating ${result.pdrName}`);

    if (stats.progress < 100 && stats.progress > 0) {
      updateObj.status = 'parsed';
      await p.update({ pdrName: result.pdrName }, updateObj);
    }
  }
}


async function updatePdrStats() {
  const params = {
    queryStringParameters: {
      fields: 'pdrName',
      status__not: 'failed,completed',
      limit: 100
    }
  };

  const search = new Search(params, process.env.PDRsTable);
  const r = await search.query();

  const p = new Pdr();

  for (const result of r.results) {
    const stats = await search.granulesStats('pdrName', result.pdrName);
    const updateObj = {
      granules: stats.granules,
      granulesStatus: stats.granulesStatus,
      progress: stats.progress,
      averageDuration: stats.averageDuration
    };

    console.log(`Updating ${result.pdrName}`);

    if (stats.progress >= 100) {
      updateObj.status = 'completed';
    }

    await p.update({ pdrName: result.pdrName }, updateObj);
  }
}

async function updateCollectionsStats() {
  const params = {
    queryStringParameters: {
      fields: 'collectionName',
      limit: 100
    }
  };

  const search = new Search(params, process.env.CollectionsTable);
  const r = await search.query();

  const c = new Collection();

  for (const result of r.results) {
    const stats = await search.granulesStats('collectionName', result.collectionName);
    const updateObj = {
      granules: stats.granules,
      granulesStatus: stats.granulesStatus,
      progress: stats.progress,
      averageDuration: stats.averageDuration
    };

    console.log(`Updating ${result.collectionName}`);
    await c.update({ collectionName: result.collectionName }, updateObj);
  }
}

/**
 * Populates an ElasticSearch table for AWS resources
 *
 */
async function populateResources() {
  const stats = new Stats('jobs');

  // get latest numbers
  log.info('Getting latest AWS resources stats');
  const result = await stats.get();
  result.createdAt = Date.now();

  // add it to DynamoDb
  const rs = new Resource();
  await rs.create(result);
  log.info('Latest AWS resources stats saved to DynamoDB');
}

export function handler(event = {}) {
  const frequency = event.frequency || 120;

  // update pdr stats every 5 seconds
  setInterval(() => {
    updatePdrStats().catch(e => log.error(e, logDetails));
  }, 5 * 1000);

  // update collections stats every 12 seconds
  setInterval(() => {
    updatePdrStats().catch(e => log.error(e, logDetails));
    consolidateAllPdrStats().catch(e => log.error(e, logDetails));
  }, 12 * 1000);

  return setInterval(() => {
    markStaleGranulesFailed().catch(e => log.error(e, logDetails));
    populateResources().catch(e => log.error(e, logDetails));
  }, parseInt(frequency) * 1000);
}


localRun(() => {
  //handler();
  //markStaleGranulesFailed().then(() => {}).catch(e => console.log(e));
  //markPdrs().then(() => {}).catch(e => console.log(e));
  //populateResources()
  updatePdrStats();
  updateCollectionsStats();
});
