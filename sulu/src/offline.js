'use strict';

const _ = require('lodash');
const path = require('path');
const Hapi = require('hapi');
const Good = require('good');
const envs = require('./envs');
const parseConfig = require('./common').parseConfig;

// const collections = require('../dist/collections')

const isLocal = process.argv[2] === 'local';
const isRemote = process.argv[2] === 'remote';

function serve() {
  if (isLocal || isRemote) {
    process.env.IS_LOCAL = isLocal;

    // set local env variables
    envs.setEnvs();

    // Read .env file if it exists
    envs.loadCredentials();
  }

  const server = new Hapi.Server({
    connections: {
      router: {
        stripTrailingSlash: true // removes trailing slashes on incoming paths.
      }
    }
  });

  server.connection({ port: 3000 });

  const c = parseConfig();
  const endpoints = [];

  for (const lambda of c.lambdas) {
    // some lambdas (ie elasticsearch sync) don't have apiGateway props, ignore these
    if (_.has(lambda, 'apiGateway')) {
      // import the lib
      const lambdaName = _.split(lambda.handler, '.')[0];
      const funcName = _.split(lambda.handler, '.')[1];
      const method = _.toUpper(lambda.apiGateway.method);
      const apPath = `/${lambda.apiGateway.path}`;

      // save the endpoint names here but log them after the server is launched
      endpoints.push(`Endpoint created: ${method} - ${apPath}`);

      const func = require(path.join(process.cwd(), `dist/${lambdaName}`))[funcName];

      server.route({
        path: apPath,
        method: method,
        handler: (req, res) => {
          func({}, null, (err, r) => {
            res(r);
          });
        }
      });
    }
  }

  server.register({
    register: Good,
    options: {
      reporters: {
        console: [{
          module: 'good-squeeze',
          name: 'Squeeze',
          args: [{
            response: '*',
            log: '*'
          }]
        }, {
          module: 'good-console'
        }, 'stdout']
      }
    }
  }, (err) => {
    if (err) {
      throw err;
    }

    server.start((error) => {
      if (error) {
        throw error;
      }
      console.log(`Server running at: ${server.info.uri}`);

      for (const endpoint of endpoints) {
        console.log(endpoint);
      }
    });
  });
}

if (require.main === module) {
  serve();
}

module.exports = serve;
