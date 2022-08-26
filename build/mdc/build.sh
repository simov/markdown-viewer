#!/bin/bash

# set current working directory to directory of the shell script
cd "$(dirname "$0")"

# before
npm install
mkdir -p tmp

# mdc.min.js
npx rollup --config rollup.js --input mdc.js --file tmp/mdc.js
npx babel tmp/mdc.js --out-file tmp/mdc.min.js

# mdc.min.css
npx node-sass --include-path node_modules/ mdc.scss tmp/mdc.css
npx csso --input tmp/mdc.css --output tmp/mdc.min.css

# copy
cp tmp/mdc.min.* ../../vendor/

# after
rm -r tmp/
rm -rf node_modules/ package-lock.json
