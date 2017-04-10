'use strict';

import AWS from 'aws-sdk';
import { Granule } from './models/granules';
import { Pdr } from './models/pdrs';
import { getEndpoint } from './aws-helpers';


/**
 * A synchronous sleep/wait function
 *
 * @param {number} milliseconds number of milliseconds to sleep
 */
export function sleep(milliseconds) {
  const start = new Date().getTime();
  for (let i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds) {
      break;
    }
  }
}


export function errorify(err) {
  return JSON.stringify(err, Object.getOwnPropertyNames(err));
}


export async function addProviderToGranules() {
  const pdrs = {};
  let LastEvaluatedKey;
  const dynamodb = new AWS.DynamoDB.DocumentClient(getEndpoint());

  const params = {
    TableName: process.env.GranulesTable,
    FilterExpression: 'attribute_not_exists(provider)'
  };

  try {
    const pdr = new Pdr();
    const g = new Granule();
    while (true) {
      if (LastEvaluatedKey) {
        params.ExclusiveStartKey = LastEvaluatedKey;
      }

      const items = await dynamodb.scan(params).promise();

      if (items.LastEvaluatedKey) {
        LastEvaluatedKey = items.LastEvaluatedKey;
      }

      for (const item of items.Items) {
        // get provider name from pdr
        if (!pdrs[item.pdrName]) {
          let tmp;
          try {
            tmp = await pdr.get({ pdrName: item.pdrName });
          }
          catch (e) {
            tmp = { provider: 'LPDAAC_HTTP_ASTER' };
          }
          pdrs[item.pdrName] = tmp.provider;
        }

        console.log(`adding ${pdrs[item.pdrName]} to ${item.granuleId}`);
        await g.update({ granuleId: item.granuleId }, { provider: pdrs[item.pdrName] });
      }

      console.log(items.Count);
      if (items.Count === 0 && !items.LastEvaluatedKey) {
        break;
      }
    }
  }
  catch (e) {
    console.log(e);
  }
}
