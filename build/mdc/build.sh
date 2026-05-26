#!/bin/bash
# Fail fast — silent failures here previously shipped empty mdc.min.js/css.
set -e

# set current working directory to directory of the shell script
cd "$(dirname "$0")"

# before
npm ci 2> /dev/null || npm i
mkdir -p tmp

# mdc.min.js
npx rollup --config rollup.mjs --input mdc.mjs --file tmp/mdc.js
npx terser --compress --mangle -- tmp/mdc.js > tmp/mdc.min.js

# mdc.min.css  (dart-sass; node-sass is deprecated and won't build on Node 22+)
npx sass --no-source-map --load-path=node_modules mdc.scss tmp/mdc.css
npx csso --input tmp/mdc.css --output tmp/mdc.min.css

# copy
cp tmp/mdc.min.* ../../vendor/

# after
rm -rf node_modules/ tmp/
