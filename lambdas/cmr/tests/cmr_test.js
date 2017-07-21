'use strict';

import test from 'ava';
import sinon from 'sinon';
import { S3 } from 'cumulus-common/aws-helpers';
import cmrjs from 'cumulus-common/cmrjs';
import { handler, Cmr } from '../index';
import payload from './data/payload.json';
const fs = require('fs');
const invalidMetaXML = fs.readFileSync(__dirname + '/data/invalid.xml', 'utf8');
const validMetaXML = fs.readFileSync(__dirname + '/data/valid.xml', 'utf8');

const result = {
  'concept-id': 'testingtesging'
};

test.before(() => {
  sinon.stub(S3, 'get').callsFake(() => ({ Body: '<xml></xml>' }));
  sinon.stub(cmrjs, 'ingestGranule').callsFake(() => ({
    result
  }));
});

test.cb.skip('testing new task subclass', (t) => {
  Cmr.handler(payload, {}, t.end);
});

test.cb.serial('should succeed with correct payload', (t) => {
  handler(payload, {}, (e, r) => {
    t.is(
      r.payload.cmrLink,
      `https://cmr.uat.earthdata.nasa.gov/search/granules.json?concept_id=${result['concept-id']}`
    );
    t.is(r.payload.published, true);
    t.end(e);
  });
});

test.cb.serial('should fail if the metadata file uri is missing', (t) => {
  var newPayload = JSON.parse(JSON.stringify(payload));
  newPayload.payload.files['meta-xml'] = null;
  handler(newPayload, {}, (e) => {
    t.truthy(e);
    t.end();
  });
});

test.cb.serial('should succeed if cmr correctly identifies the xml as invalid', (t) => {
  cmrjs.ingestGranule.restore();
  S3.get.restore();
  sinon.stub(S3, 'get').callsFake(() => ({ Body: invalidMetaXML }));
  handler(payload, {}, (e) => {
    console.log(e)
    t.truthy(e);
    t.end();
  });
});

test.cb.serial('should succeed if cmr correctly identifies the xml as valid', (t) => {
  S3.get.restore();
  sinon.stub(S3, 'get').callsFake(() => ({ Body: validMetaXML }));
  handler(payload, {}, (e) => {
    console.log(e)
    t.falsy(e);
    t.end();
  });
});

// TODO: write tests for
//  - when metadata fails CMR validation
//  - when CMR is down
//  - when username/password is incorrect

test.after(() => {
  S3.get.restore();
});
