import d2es from 'dynamo2es-lambda';
import { has } from 'lodash';
import { config } from 'cumulus-common/es';

const esConfig = {
  host: config.host,
  region: config.amazonES.region,
  credentials: config.amazonES.credentials
};

export const handler = d2es({
  elasticsearch: esConfig,
  index: 'cumulus-api',
  type: process.env.ES_TYPE || 'type',
  recordErrorHook: (event, context, err) => console.log(err)
});
