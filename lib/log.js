
// Copyright 2011 Splunk, Inc.
//
// Licensed under the Apache License, Version 2.0 (the 'License'): you may
// not use this file except in compliance with the License. You may obtain
// a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

// This example shows a simple log handler that will print to the console
// as well as log the information to a Splunk instance.

const splunkjs = require('splunk-sdk');

const SplunkLogger = splunkjs.Class.extend({
  init: function init(service, opts) {
    this.service = service;

    opts = opts || {};

    this.params = {};
    if (opts.index) {
      this.params.index = opts.index;
    }
    if (opts.host) {
      this.params.host = opts.host;
    }
    if (opts.source) {
      this.params.source = opts.source;
    }
    if (opts.sourceType) {
      this.params.sourcetype = opts.sourceType || 'demo-logger';
    }

    if (!this.service) {
      throw new Error('Must supply a valid service');
    }
  },

  _sendLog: function _sendLog(data, level) {
    const message = {
      __time: (new Date()).toUTCString(),
      level: level,
      data: data
    };

    this.service.log(message, this.params);
    console.log(`[${level}] ${data}`);
  },

  log: function log(data, level) {
    this._sendLog(data, level);
  },

  error: function error(data, level) {
    this._sendLog(data, level);
  },

  info: function info(data, level) {
    this._sendLog(data, level);
  },

  warn: function warn(data, level) {
    this._sendLog(data, level);
  },

  debug: function debug(data, level) {
    this._sendLog(data, level);
  }
});


export default class {
  generic(msg, level) {
    if (process.env.IS_LOCAL === 'true') {
      if (level === 'error') {
        console.error(`${this.name}: [${level.toUpperCase()}] ${msg}`);
      }

      console.log(`${this.name}: [${level.toUpperCase()}] ${msg}`);
      return;
    }

    if (!this.splunkLogger) {
      const service = new splunkjs.Service({
        scheme: 'https',
        host: process.env.SPLUNK_HOST,
        port: process.env.SPLUNK_PORT || 8089,
        username: process.env.SPLUNK_USERNAME,
        password: process.env.SPUNK_PASSWORD
      });

      //await new Promise((resolve, reject) => {
      service.login((err) => {
        if (err) console.error(err);
        this.splunkLogger = new SplunkLogger(
          service,
          { sourceType: 'cumulusLogger', source: this.name }
        );
        this.splunkLogger[level](msg, level.toUpperCase());
      });
    }
    else {
      this.splunkLogger[level](msg, level.toUpperCase());
    }
  }

  constructor(name) {
    this.name = name;
    this.splunkLogger = null;
  }

  log(msg) {
    this.generic(msg, 'log');
  }

  info(msg) {
    this.generic(msg, 'info');
  }

  warn(msg) {
    this.generic(msg, 'warn');
  }

  debug(msg) {
    this.generic(msg, 'debug');
  }

  error(msg) {
    this.generic(msg, 'error');
  }
}

