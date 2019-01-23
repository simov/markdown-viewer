#!/bin/bash

# before
cd build/mdc/
rm -rf tmp/
mkdir -p tmp

# mdc.min.js
npx rollup --config rollup.js --input mdc.js --file tmp/mdc.js
npx babel tmp/mdc.js --out-file tmp/mdc.min.js

# mdc.min.css
npx node-sass --include-path ../../node_modules/ mdc.scss tmp/mdc.css
npx csso --input tmp/mdc.css --output tmp/mdc.min.css

# copy
cp tmp/mdc.min.* ../../vendor/

# after
rm -r tmp/
