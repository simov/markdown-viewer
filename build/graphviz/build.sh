#!/bin/bash

cd "$(dirname "$0")"

npm ci 2> /dev/null || npm i

cp node_modules/@hpcc-js/wasm/dist/graphviz.umd.js ../../vendor/graphviz.min.js

rm -rf node_modules/
