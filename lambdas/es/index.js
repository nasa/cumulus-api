import d2es from 'dynamo2es-lambda';

export const handler = d2es({
  elasticsearch: {
    hosts: process.env.ES_HOST
  },
  index: 'cumulus-api',
  type: process.env.ES_TYPE
});
