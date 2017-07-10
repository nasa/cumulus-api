'use strict';

import test from 'ava';
import sinon from 'sinon';
import { S3 } from 'cumulus-common/aws-helpers';
import cmrjs from 'cumulus-common/cmrjs';
import { handler, Cmr } from '../index';
import payload from './data/payload.json';

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

test.cb('should succeed with correct payload', (t) => {
  handler(payload, {}, (e, r) => {
    t.is(
      r.payload.cmrLink,
      `https://cmr.uat.earthdata.nasa.gov/search/granules.json?concept_id=${result['concept-id']}`
    );
    t.is(r.payload.published, true);
    t.end(e);
  });
});

test.cb('Should fail if the metadata file uri is missing', (t) => {
  const newPayload = Object.assign({}, payload);
  newPayload.payload.files['meta-xml'] = null;
  handler(newPayload, {}, (e) => {
    t.truthy(e);
    t.end();
  });
});

// TODO: write tests for
//  - when metadata fails CMR validation
//  - when CMR is down
//  - when username/password is incorrect

test.after(() => {
  S3.get.restore();
  cmrjs.ingestGranule.restore();
});
