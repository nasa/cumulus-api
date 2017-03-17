'use strict';

import moment from 'moment';
import log from 'cumulus-common/log';
import { localRun } from 'cumulus-common/local';
import { Search } from 'cumulus-common/es/search';
import { Granule, Pdr } from 'cumulus-common/models';

/**
 * markStaleGranulesFailed
 *
 * @param {number} timeElapsed=15
 * @param {string} timeUnit='minute'
 */

async function markStaleGranulesFailed(timeElapsed = 15, timeUnit = 'minute') {
  const g = new Granule();

  const r = await g.scan({
    filter: '#statusName <> :status1 AND #statusName <> :status2 AND updatedAt < :time',
    names: {
      '#statusName': 'status'
    },
    values: {
      ':status1': 'completed',
      ':status2': 'failed',
      ':time': moment().subtract(timeElapsed, timeUnit).unix() * 1000
    }
  }, 'granuleId');

  const errMsg = ('did not complete ' +
    `or fail for at least ${timeElapsed} ${timeUnit}s`);

  if (r.Count) {
    log.info(`${r.Count} granules ${errMsg}. Marking them as failed`);

    await Promise.all(r.Items.map(item => g.hasFailed(
      { granuleId: item.granuleId }, `The granule ${errMsg}`
    )));
  }
}


async function markPdrs() {
  const params = {
    queryStringParameters: {
      fields: 'pdrName',
      isActive: true,
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
      const total = i.granulesStatus.completed + i.granulesStatus.failed;
      if (total >= i.granules) {
        return true;
      }
      return false;
    });

    log.info(`Found ${completed.length} completed PDRs. Marding them as completed`);

    // mark them as completed
    const p = new Pdr();
    await Promise.all(completed.map(i => p.hasCompleted(
      i.pdrName, i.granules === i.granulesStatus.completed
    )));
  }
}

export function handler(event = {}) {
  const frequency = event.frequency || 120;

  return setInterval(() => {
    markPdrs();
    markStaleGranulesFailed(5);
  }, parseInt(frequency) * 100);
}


localRun(() => {
  handler();
  //markStaleGranulesFailed(1).then(() => {}).catch(e => console.log(e));
  //markPdrs().then(() => {}).catch(e => console.log(e));
});
