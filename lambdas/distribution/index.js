'use strict';

import { localRun } from 'cumulus-common/local';
import { Distribution } from 'cumulus-common/models';
import querystring from 'querystring';
import request from 'request';
// To speed up Lambda, delete all DATs in this package's `data` directory
// besides country-level ones; it has to load all DATs into memory at launch time
//const geoip = require('geoip-lite');
const AWS = require('aws-sdk');


const EARTHDATA_CLIENT_ID = 'xxx';
const EARTHDATA_CLIENT_PASSWORD = 'xxx';
const DEPLOYMENT_ENDPOINT = `${process.env.distributionEndpoint}/redirect`;

const EARTHDATA_BASE_URL = 'https://urs.earthdata.nasa.gov';
const EARTHDATA_GET_CODE_URL = `${EARTHDATA_BASE_URL}/oauth/authorize`;
const EARTHDATA_CHECK_CODE_URL = `${EARTHDATA_BASE_URL}/oauth/token`;

/**
 * An AWS API Gateway function that either requests authentication,
 * or if authentication is found then redirects to an S3 file for download
 *
 * There are three main conditionals that control the UX flow,
 * following the patterns laid out in the EarthData Login OAuth specs:
 * https://urs.earthdata.nasa.gov/sso_client_impl
 *
 * 1. If the user does not have a token in their cookies, nor a
 * code in their querystring, then redirect them to the EarthData
 * Login page, where they enter their credentials and are redirected
 * with a code in their querystring
 *
 * 2. If the user has a code, then check that it is valid by making
 * a request to the EarthData servers. If the check is successful,
 * this will yield a username and token, which are stored in cookies
 *
 * 3. If the user has a username and auth token in their cookies,
 * then authorize them to access the requested file from the S3 bucket
 */
export function handler(event, context, cb) {
  const s3 = new AWS.S3();

  console.log(event);
  //return cb('exit');

  let granuleKey = null;
  let query = {};

  if (event.pathParameters) {
    granuleKey = event.pathParameters.granuleId;
  }

  if (event.queryStringParameters) {
    query = event.queryStringParameters;
    granuleKey = query.state;
  }

  // code means that this is a redirect back from
  // earthData login
  if (query.code) {
    console.log('inside code')
    // we send the code to another endpoint to verify
    request.post({
      url: EARTHDATA_CHECK_CODE_URL,
      form: {
        grant_type: 'authorization_code',
        code: query.code,
        redirect_uri: DEPLOYMENT_ENDPOINT
      },
      auth: {
        user: EARTHDATA_CLIENT_ID,
        password: EARTHDATA_CLIENT_PASSWORD,
        sendImmediately: true
      }
    }, (err, response, body) => {

      console.log(body);
      const tokenInfo = JSON.parse(body);
      const accessToken = tokenInfo.access_token;

      // if no access token is given, then the code is wrong
      if (typeof accessToken === 'undefined') {
        return cb(null, {
          statusCode: '400',
          body: '{"error": "Failed to get EarthData token"}'
        });
      }

      const user = tokenInfo.endpoint.replace('/api/users/', '');


      // otherwise we get the temp url and provide it to the user
      const url = s3.getSignedUrl('getObject', {
        Bucket: process.env.protected,
        Key: granuleKey
      });

      // now that we have the URL we have to save user's info
      const d = new Distribution();
      d.create({
        userName: user,
        accessDate: Date.now(),
        file: granuleKey,
        ip: event.sourceIp
      }).then(() => {
        // Serve the URL to the use
        cb(null, {
          statusCode: '302',
          body: 'redirecting',
          headers: {
            Location: url
          }
        });
      }).catch(e => {
        cb(e);
      });
    });
  }
  else {
    console.log('no code')
    // ending up here means that user was not login
    // with earthdata and has to login
    const qs = {
      response_type: 'code',
      client_id: EARTHDATA_CLIENT_ID,
      redirect_uri: DEPLOYMENT_ENDPOINT,
      // For EarthData OAuth, we can use the `state` to remember which granule is being requested
      state: granuleKey
    };
    const response = {
      statusCode: '302',
      body: JSON.stringify({ error: 'you messed up!' }),
      headers: {
        Location: `${EARTHDATA_GET_CODE_URL}?${querystring.stringify(qs)}`
      }
    };

    console.log(response);

    return cb(null, response);
  }
}

localRun(() => {
  handler({
    query: {
      code: undefined
    }
  }, null, (e, r) => {
    console.log(e, r)
  });
});
