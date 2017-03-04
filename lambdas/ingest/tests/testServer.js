'use strict';

/*
 * The code is taken from https://github.com/Marketionist/node-testing-server
 */

// #############################################################################

import http from 'http';
import fs from 'fs';
import path from 'path';

export const testingServer = {
  // Config default options
  config: {
    hostname: 'localhost',
    port: 3001,
    logsEnabled: 0,
    root: './lambdas/pdr/tests/data/'
  },

  server: http.createServer((req, res) => {
    const status200 = 200;
    const status404 = 404;

    // Show logs if they are enabled in testingServer.config.logsEnabled
    if (testingServer.config.logsEnabled >= 1) {
      // Print incoming request METHOD, URL and outcoming response CODE
      console.log(`${req.method} ${req.url} ${res.statusCode}`);
    }
    if (testingServer.config.logsEnabled === 2) {
      // Print incoming request headers
      console.log('\nRequest headers:\n', req.headers, '\n');
      // Start counting response time
      console.time('Response time');
    }

    if (req.method === 'GET') {
      if (req.url === '/') {
        console.log(__dirname);
        const mainPagePath = path.join(testingServer.config.root, 'index.html');

        res.writeHead(status200, { 'Content-Type': 'text/html' });
        fs.createReadStream(mainPagePath).pipe(res);
        // Show logs if they are enabled in testingServer.config.logsEnabled
        if (testingServer.config.logsEnabled >= 1) {
          console.log(`Served ${mainPagePath} from the server to the client`);
        }
        if (testingServer.config.logsEnabled === 2) {
          console.timeEnd('Response time');
        }

        return;
      }

      const fileURL = req.url;
      const filePath = path.resolve(`public/${fileURL}`);
      const fileExtension = path.extname(filePath);

      if (fileExtension === '.html') {
        fs.exists(filePath, (exists) => {
          // If requested page cannot be found in public/ folder,
          // then it will be generated from testingServer.config.pages
          if (!exists) {
            res.writeHead(status200, { 'Content-Type': 'text/html' });
            res.end(testingServer.config.pages[fileURL]);
            // Show logs if they are enabled in testingServer.config.logsEnabled
            if (testingServer.config.logsEnabled >= 1) {
              console.log(`Generated ${fileURL} from testingServer.config.pages`);
            }
            if (testingServer.config.logsEnabled === 2) {
              console.timeEnd('Response time');
            }

            return;
          }
          res.writeHead(status200, { 'Content-Type': 'text/html' });
          fs.createReadStream(filePath).pipe(res);
          // Show logs if they are enabled in testingServer.config.logsEnabled
          if (testingServer.config.logsEnabled >= 1) {
            console.log(`Served ${filePath} from the server to the client`);
          }
          if (testingServer.config.logsEnabled === 2) {
            console.timeEnd('Response time');
          }

          return;
        });
      }
      else {
        res.writeHead(status404, { 'Content-Type': 'text/html' });
        res.end(`<h1>Error 404: ${fileURL} is not an HTML file</h1>`);
      }
    }
    else {
      res.writeHead(status404, { 'Content-Type': 'text/html' });
      res.end(`<h1>Error 404: ${req.method} is not supported</h1>`);
    }
  }),

  start() {
    return this.server.listen(testingServer.config.port, testingServer.config.hostname)
      .on('listening', () => console.log(
        `Server running at http://${testingServer.config.hostname}:${testingServer.config.port}/`))
      .on('error', (err) => console.log('Error starting server:', err));
  },

  stop() {
    return this.server.close()
      .on('close', () => console.log(
        `Server stopped at http://${testingServer.config.hostname}:${testingServer.config.port}/`))
      .on('error', (err) => console.log('Error stopping server:', err));
  }

};

