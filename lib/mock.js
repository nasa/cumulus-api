'use strict';

import AWS from 'aws-sdk';
import sinon from 'sinon';

export default class AWSMock {

  constructor(service, method, success = null, failure = null) {
    this.service = service;
    this.method = method;
    this.spy = sinon.spy();
    this.success = success;
    this.failure = failure;
    this.methods = {};
  }

  add(method, success, failure) {
    this.methods[method] = (params) => {
      this.spy(params);
      return {
        promise: () => new Promise((rs, rj) => {
          if (failure) {
            return rj(failure);
          }
          return rs(success);
        })
      };
    };
  }

  apply() {
    if (Object.keys(this.methods).length > 0) {
      sinon.stub(AWS, this.service).returns(this.methods);
    }
    else {
      throw new Error('No method is added');
    }
  }

  get args() {
    return this.spy.args[0][0];
  }

  getArgs(arg = 0) {
    return this.spy.args[arg][0];
  }

  restore() {
    AWS[this.service].restore();
  }
}
