#!/bin/bash

# set current working directory to directory of the shell script
cd "$(dirname "$0")"

# before
npm ci 2> /dev/null || npm i
mkdir -p tmp

# copy plotly.min.js
cp node_modules/plotly.js-dist-min/plotly.min.js ../../vendor/

# after
rm -rf node_modules/ tmp/ 