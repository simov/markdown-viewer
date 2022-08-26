#!/bin/bash

# set current working directory to directory of the shell script
cd "$(dirname "$0")"

# before
npm install
mkdir -p tmp

# build
node prism.js

# copy
cp tmp/prism.min.* ../../vendor/

# after
rm -r tmp/
rm -rf node_modules/ package-lock.json
