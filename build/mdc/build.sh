#!/bin/bash

# set current working directory to directory of the shell script
cd "$(dirname "$0")"

# before
npm ci 2> /dev/null || npm i
mkdir -p tmp

# copy
mkdir -p ../../vendor/mdc
cp node_modules/@material/ripple/dist/mdc.ripple.min.js ../../vendor/mdc/mdc.ripple.min.js
cp node_modules/@material/tabs/dist/mdc.tabs.min.js ../../vendor/mdc/mdc.tabs.min.js
cp node_modules/@material/textfield/dist/mdc.textfield.min.js ../../vendor/mdc/mdc.textfield.min.js

# mdc.min.css
npx node-sass --include-path node_modules/ mdc.scss tmp/mdc.css
npx csso --input tmp/mdc.css --output tmp/mdc.min.css

# copy
cp tmp/mdc.min.* ../../vendor/

# after
rm -rf node_modules/ tmp/
