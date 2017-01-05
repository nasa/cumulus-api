'use strict';

const _ = require('lodash');
const Hapi = require('hapi');
const Good = require('good');
const parseConfig = require('./common').parseConfig;

// const collections = require('../dist/collections')


function serve() {
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
    // import the lib
    const lambdaName = _.split(lambda.handler, '.')[0];
    const funcName = _.split(lambda.handler, '.')[1];
    const method = _.toUpper(lambda.apiGateway.method);
    const path = `/${lambda.apiGateway.path}`;

    // save the endpoint names here but log them after the server is launched
    endpoints.push(`Endpoint created: ${method} - ${path}`);

    const func = require(`../../dist/${lambdaName}`)[funcName];

    server.route({
      path: path,
      method: method,
      handler: (req, res) => {
        func({}, null, (err, r) => {
          res(r);
        });
      }
    });
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