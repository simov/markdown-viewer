#!/bin/bash

# set current working directory to directory of the shell script
cd "$(dirname "$0")"

# before
npm install
mkdir -p tmp

# marked.min.js
npx rollup --config rollup.js --input marked.mjs --file tmp/marked.js
npx terser --compress --mangle -- tmp/marked.js > tmp/marked.min.js

# copy
cp tmp/marked.min.js ../../vendor/

# after
rm -r tmp/
rm -rf node_modules/ package-lock.json
