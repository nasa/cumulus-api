'use strict';

import moment from 'moment';
import log from 'cumulus-common/log';
import { localRun } from 'cumulus-common/local';
import { Search } from 'cumulus-common/es/search';
import { Granule, Pdr, Resource } from 'cumulus-common/models';
import { Stats } from 'cumulus-common/stats';


/**
 * markStaleGranulesFailed
 *
 * @param {number} timeElapsed=15
 * @param {string} timeUnit='minute'
 */

async function markStaleGranulesFailed(timeElapsed = 20, timeUnit = 'minute') {
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


async function markPdrs() {
  // mark parsed PDRs as completed
  const params = {
    queryStringParameters: {
      fields: 'pdrName',
      status__in: 'parsed,discovered',
      limit: 100
    }
  };

  const search = new Search(params, process.env.PDRsTable);
  const r = await search.query(true);

  if (r.meta.count) {
    // iterate over all items
    // if the total of completed and failed granules matches
    // the total granules, mark the pdr as completed
    const completed = r.results.filter((i) => {
      if (i.granulesStatus) {
        const total = i.granulesStatus.completed + i.granulesStatus.failed;
        if (total >= i.granules && total > 0) {
          return true;
        }
      }
      return false;
    });

    if (completed.length > 0) {
      log.info(`Found ${completed.length} completed PDRs. Marking them as completed`);

      // mark them as completed
      const p = new Pdr();
      await Promise.all(completed.map((i) => {
        if (i.granulesStatus) {
          return p.hasCompleted(
            i.pdrName, i.granules === i.granulesStatus.completed
          );
        }
        return true;
      }));
    }
    else {
      console.log('All PDRs are doing great');
    }
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

  return setInterval(() => {
    markPdrs().catch(e => console.log(e));
    markStaleGranulesFailed().catch(e => console.log(e));
    populateResources().catch(e => console.log(e));
  }, parseInt(frequency) * 1000);
}


localRun(() => {
  //handler();
  //markStaleGranulesFailed().then(() => {}).catch(e => console.log(e));
  markPdrs().then(() => {}).catch(e => console.log(e));
  //populateResources()
});
