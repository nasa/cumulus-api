'use strict';
// the import below is needed to run the test
import "babel-polyfill";
import http from 'http';
import assert from 'assert';
import sinon from 'sinon';
import { exec } from '../aws/common';
import { getQueueUrl } from '../aws-helpers';

describe('Testing AWS Helpers', () => {
  before((done) => {
    // IMPORTANT otherwise test tries to connect to AWS
    process.env.IS_LOCAL = true;

    // run bootstrap
    exec('bin/bootstrap');
    done();
  });

  it('getQueueUrl must return a valid SQS Url', (done) => {
    getQueueUrl('cumulus-api-test2-dev-PDRsQueue').then((url) => {
      assert.equal(url.QueueUrl, 'http://localhost:9324/queue/cumulus-api-test2-dev-PDRsQueue');
      done();
    }).catch((e) => {
      done(e);
    });
  });

  it('getQueueUrl should return error if queue is not found', (done) => {
    getQueueUrl('some queue').catch((e) => {
      assert.ok(e)
      done();
    });
  });
});

