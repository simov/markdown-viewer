#!/bin/bash

# set current working directory to directory of the shell script
cd "$(dirname "$0")"

# before
npm ci 2> /dev/null || npm i

# copy
cp node_modules/mithril/mithril.min.js ../../vendor/mithril.min.js

# after
rm -rf node_modules/
