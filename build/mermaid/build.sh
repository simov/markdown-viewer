#!/bin/bash

# set current working directory to directory of the shell script
cd "$(dirname "$0")"

# before
npm ci 2> /dev/null || npm i
mkdir -p tmp

# mermaid.min.js
node fix-csp-issue.js \
  node_modules/mermaid/dist/mermaid.min.js \
  tmp/mermaid.min.js

# copy
cp tmp/mermaid.min.js ../../vendor/mermaid.min.js

# after
rm -rf node_modules/ tmp/
