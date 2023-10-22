#!/bin/bash

# set current working directory to directory of the shell script
cd "$(dirname "$0")"

# before
npm ci 2> /dev/null || npm i
mkdir -p tmp

# mdc.min.js
npx rollup --config rollup.mjs --input mdc.mjs --file tmp/mdc.js
npx terser --compress --mangle -- tmp/mdc.js > tmp/mdc.min.js

# mdc.min.css
npx node-sass --include-path node_modules/ mdc.scss tmp/mdc.css
npx csso --input tmp/mdc.css --output tmp/mdc.min.css

# copy
cp tmp/mdc.min.* ../../vendor/

# after
rm -rf node_modules/ tmp/
