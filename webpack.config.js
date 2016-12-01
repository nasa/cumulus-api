const path = require('path');
const fs = require('fs');
const glob = require('glob');

module.exports = {
  entry: glob.sync('./lambdas/*')
             .map((filename) => {
               const entry = {};
               entry[path.basename(filename)] = filename;
               return entry;
             })
             .reduce((finalObject, entry) => Object.assign(finalObject, entry), {}),
  output: {
    path: path.join(__dirname, 'dist'),
    library: '[name]',
    libraryTarget: 'commonjs2',
    filename: '[name]/index.js'
  },
  target: 'node',
  externals: [
    'aws-sdk'
  ],
  node: {
    __dirname: false,
    __filename: false
  },
  devtool: '#inline-source-map',
  module: {
    resolve: {
      alias: {
        'aws-sdk': 'aws-sdk/dist/aws-sdk'
      }
    },
    noParse: [
      /graceful-fs\/fs.js/,
      /dynamoose/
    ],
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: JSON.parse(
          fs.readFileSync(path.join(__dirname, '.babelrc'), { encoding: 'utf8' })
        )
      },
      {
        include: glob.sync('./lambdas/*/index.js', { realpath: true })
                     .map((filename) => path.resolve(__dirname, filename)),
        exclude: /node_modules/,
        loader: 'prepend',
        query: {
          data: "'use strict';\n \
          if (!global._babelPolyfill) require('babel-polyfill'); \n \
          ;require('source-map-support').install();"
        }
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  }
};
