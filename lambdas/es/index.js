import d2es from 'dynamo2es-lambda';
import { has } from 'lodash';

// env variables are added automatically.
// https://github.com/AntonBazhal/aws-elasticsearch-client/blob/master/index.js#L14
const esConfig = {
  host: process.env.ES_HOST
};

export const handler = d2es({
  elasticsearch: esConfig,
  index: 'cumulus-api',
  type: process.env.ES_TYPE
});
