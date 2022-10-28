#!/bin/bash

# set current working directory to directory of the shell script
cd "$(dirname "$0")"

# before
npm install
mkdir -p tmp

# remark.min.js
npx rollup --config rollup.js --input remark.mjs --file tmp/remark.js
npx terser --compress --mangle -- tmp/remark.js > tmp/remark.min.js

# copy
cp tmp/remark.min.js ../../vendor/

# after
rm -r tmp/
rm -rf node_modules/ package-lock.json
