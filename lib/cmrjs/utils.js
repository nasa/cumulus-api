import publicIp from 'public-ip';
import request from 'request';
import xml2js from 'xml2js';
import { localRun } from '../local';

function getHost() {
  const env = process.env.CMR_ENVIRONMENT;
  let host;

  if (env === 'OPS') {
    host = 'cmr.earthdata.nasa.gov';
  }
  else if (env === 'SIT') {
    host = 'cmr.sit.earthdata.nasa.gov';
  }
  else {
    host = 'cmr.uat.earthdata.nasa.gov';
  }

  return host;
}


export const xmlParseOptions = {
  ignoreAttrs: true,
  mergeAttrs: true,
  explicitArray: false
};


export function getUrl(type) {
  let url;
  const host = getHost();
  const env = process.env.CMR_ENVIRONMENT;
  const provider = process.env.CMR_PROVIDER;

  switch (type) {
    case 'token':
      if (env === 'OPS') {
        url = 'https://api.echo.nasa.gov/echo-rest/tokens/';
      }
      else if (env === 'SIT') {
        url = 'https://testbed.echo.nasa.gov/echo-rest/tokens/';
      }
      else {
        url = 'https://api-test.echo.nasa.gov/echo-rest/tokens/';
      }
      break;
    case 'search':
      url = `https://${host}/search/`;
      break;
    case 'validate':
      url = `https://${host}/ingest/providers/${provider}/validate/`;
      break;
    case 'ingest':
      url = `https://${host}/ingest/providers/${provider}/`;
      break;
    default:
      url = null;
  }

  return url;
}


export async function validate(type, xml, identifier, token) {
  const result = await new Promise((resolve, reject) => {
    request.post({
      url: `${getUrl('validate')}${type}/${identifier}`,
      body: xml,
      headers: {
        'Echo-Token': token,
        'Content-type': 'application/echo10+xml'
      }
    }, (err, resp) => {
      if (err) reject(err);
      resolve(resp);
    });
  });

  if (result.statusCode === 200) {
    return true;
  }

  const parsed = await new Promise((resolve, reject) => {
    xml2js.parseString(result.body, xmlParseOptions, (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });

  throw new Error(
    `Validation was not successful, CMR error message: ${JSON.stringify(parsed.errors.error)}`
  );
}


export async function updateToken() {
  // Update the saved ECHO token
  // for info on how to add collections to CMR: https://cmr.earthdata.nasa.gov/ingest/site/ingest_api_docs.html#validate-collection
  const ip = await publicIp.v4();

  const tokenData = {
    token: {
      username: process.env.CMR_USERNAME,
      password: process.env.CMR_PASSWORD,
      client_id: process.env.CMR_CLIENT_ID,
      user_ip_address: ip,
      provider: process.env.CMR_PROVIDER
    }
  };

  const builder = new xml2js.Builder();
  const xml = builder.buildObject(tokenData);

  let resp = await new Promise((resolve, reject) => {
    request.post({
      url: getUrl('token'),
      body: xml,
      headers: { 'Content-Type': 'application/xml' }
    }, (err, response) => {
      if (err) reject(err);
      resolve(response);
    });
  });

  resp = await new Promise((resolve, reject) => {
    xml2js.parseString(resp.body, xmlParseOptions, (err, response) => {
      if (err) reject(err);
      resolve(response);
    });
  });

  if (!resp.token) {
    throw new Error('Authentication with CMR failed');
  }
  return resp.token.id;
}

export async function tokenIsValid(token) {
  // Use a fake collection ID and fake PUT data to see if the token is still valid
  const resp = await new Promise((resolve, reject) => {
    request.put({
      url: `https://cmr.uat.earthdata.nasa.gov/ingest/providers/${process.env.CMR_PROVIDER}/collections/CMRJS_TOKEN_TEST`,
      body: null,
      headers: {
        'Echo-Token': token,
        'Content-type': 'application/echo10+xml'
      }
    }, (err, response) => {
      if (err) return reject(err);
      const body = response.body;
      if (body.toLowerCase().includes('token') ||
          body.toLowerCase().includes('expired') ||
          body.toLowerCase().includes('permission')) {
        return resolve(false);
      }
      console.log(body);
      resolve(true);
    });
  });

  return resp;
}
