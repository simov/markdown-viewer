#!/bin/bash

cd "$(dirname "$0")"

npm ci 2> /dev/null || npm i

cp node_modules/vega/build/vega.min.js ../../vendor/vega.min.js
cp node_modules/vega-interpreter/build/vega-interpreter.min.js ../../vendor/vega-interpreter.min.js
cp node_modules/vega-lite/build/vega-lite.min.js ../../vendor/vega-lite.min.js
cp node_modules/vega-embed/build/vega-embed.min.js ../../vendor/vega-embed.min.js

cat ../../vendor/vega.min.js \
  ../../vendor/vega-interpreter-polyfill.js \
  ../../vendor/vega-interpreter.min.js \
  ../../vendor/vega-lite.min.js \
  ../../vendor/vega-embed.min.js \
  > ../../vendor/vega-stack.min.js

rm -rf node_modules/
