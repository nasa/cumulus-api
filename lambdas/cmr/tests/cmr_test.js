'use strict';

import test from 'ava';
import sinon from 'sinon';
import { S3 } from 'cumulus-common/aws-helpers';
import cmrjs from 'cumulus-common/cmrjs';
const utils = require('cumulus-common/cmrjs/utils.js')
const got = require('got')
import { handler } from '../index';
import payload from './data/payload.json';
const fs = require('fs');
const invalidMetaXML = fs.readFileSync(__dirname + '/data/invalid.xml', 'utf8');
const validMetaXML = fs.readFileSync(__dirname + '/data/valid.xml', 'utf8');

const result = {
  'concept-id': 'testingtesging'
};


const granuleId = '1A0000-2016111101_000_001';
const collectionName = 'AST_L1A';

test.before(() => {
  sinon.stub(S3, 'get').callsFake(() => ({ Body: '<xml></xml>' }));
  sinon.stub(cmrjs, 'ingestGranule').callsFake(() => ({
    result
  }));
});

test.cb.serial('should succeed with correct payload', (t) => {
  var newPayload = JSON.parse(JSON.stringify(payload));
  t.is(newPayload.meta.granules[granuleId].published, false);
  handler(newPayload, {}, (e, r) => {
    t.is(e, null);
    t.is(
      r.meta.granules[granuleId].cmrLink,
      `https://cmr.uat.earthdata.nasa.gov/search/granules.json?concept_id=${result['concept-id']}`
    );
    t.is(r.meta.granules[granuleId].published, true);
    t.end(e);
  });
});

test.cb.serial('Should skip cmr step if the metadata file uri is missing', (t) => {
  var newPayload = JSON.parse(JSON.stringify(payload));
  t.is(newPayload.meta.granules[granuleId].published, false);
  newPayload.payload.output[collectionName].granules[0].files['meta-xml'] = null;
  handler(newPayload, {}, (e, r) => {
    t.is(r.meta.granules[granuleId].published, false);
    t.end();
  });
});

test.cb.serial('should succeed if cmr correctly identifies the xml as invalid', (t) => {
  var newPayload = JSON.parse(JSON.stringify(payload));
  t.is(newPayload.meta.granules[granuleId].published, false);
  cmrjs.ingestGranule.restore();
  S3.get.restore();
  sinon.stub(S3, 'get').callsFake(() => ({ Body: invalidMetaXML }));
  handler(newPayload, {}, (e) => {
    t.truthy(e);
    t.end();
  });
});

test.cb.serial('should succeed if cmr correctly identifies the xml as valid', (t) => {
  var newPayload = JSON.parse(JSON.stringify(payload));
  t.is(newPayload.meta.granules[granuleId].published, false);
  S3.get.restore();
  sinon.stub(S3, 'get').callsFake(() => ({ Body: validMetaXML }));
  handler(newPayload, {}, (e) => {
    t.falsy(e);
    t.end();
  });
});

test.cb.serial('should succeed if program throws a 422 error when username and password are incorrect', (t) => {
  var newPayload = JSON.parse(JSON.stringify(payload));
  t.is(newPayload.meta.granules[granuleId].published, false);
  const fakeUpdateToken = utils.updateToken
  sinon.stub(utils, 'updateToken').callsFake((cmrProvider, clientId) => fakeUpdateToken(cmrProvider, clientId, 'fakeUser', 'fakePassword'))
  handler(newPayload, {}, (e) => {
    t.is(e.host, 'api-test.echo.nasa.gov')
    t.is(e.statusCode, 422)
    t.end();
  });
});

test.cb.serial('should succeed if program throws a timed out error when cmr is inaccesible', (t) => {
  var newPayload = JSON.parse(JSON.stringify(payload));
  t.is(newPayload.meta.granules[granuleId].published, false);
  utils.updateToken.restore()
  sinon.stub(utils, 'getUrl').callsFake(() => ('https://does.not.exist.nasa.gov/'))
  handler(newPayload, {}, (e,r) => {
    t.is(e.code, 'ETIMEDOUT')
    t.end();
  });
});

test.after(() => {
  S3.get.restore();
});
