#!/bin/bash

# set current working directory to directory of the shell script
cd "$(dirname "$0")"

# before
npm install
mkdir -p tmp

# build
node prism.js

# copy
cp tmp/prism.min.js ../../vendor/
cp tmp/prism-autoloader.min.js ../../vendor/
cp tmp/prism.min.css ../../vendor/
cp tmp/prism-okaidia.min.css ../../vendor/
# languages
mkdir -p ../../vendor/prism/
cp node_modules/prismjs/components/prism-*.min.js ../../vendor/prism/

# after
rm -r tmp/
rm -rf node_modules/ package-lock.json
