#!/bin/bash

# set current working directory to directory of the shell script
cd "$(dirname "$0")"

# before
npm ci 2> /dev/null || npm i
mkdir -p tmp

# markdown-it.min.js
npx rollup --config rollup.mjs --input markdown-it.mjs --file tmp/markdown-it.js
npx terser --compress --mangle -- tmp/markdown-it.js > tmp/markdown-it.min.js

# copy
cp tmp/markdown-it.min.js ../../vendor/

# after
rm -rf node_modules/ tmp/
