#!/bin/sh

set -e

cp -Rv /source /build
(
  set -e
  cd /build
  tar -xf modules.tar
  npm run prepublish
  # ./node_modules/.bin/mocha-webpack \
  #   --webpack-config webpack.config-test.js \
  #   --reporter xunit \
  #   --reporter-options output=/artifacts/results.xml \
  #   --recursive lib/tests lambdas/*/tests
  ./node_modules/.bin/mocha-webpack \
    --webpack-config webpack.config-test.js \
    --recursive lib/tests lambdas/*/tests
)
chown -R "${RELEASE_UID}:${RELEASE_GID}" /artifacts/results.xml
