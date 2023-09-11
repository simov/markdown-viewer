#!/bin/bash

# set current working directory to directory of the shell script
cd "$(dirname "$0")"

# before
npm install
mkdir -p tmp

# markdown-it.min.js
npx rollup --config rollup.js --input markdown-it.mjs --file tmp/markdown-it.js
npx terser --compress --mangle -- tmp/markdown-it.js > tmp/markdown-it.min.js

# copy
cp tmp/markdown-it.min.js ../../vendor/

# after
rm -r tmp/
rm -rf node_modules/ package-lock.json
