#!/bin/bash

cd "$(dirname "$0")"

npm ci 2> /dev/null || npm i

cp node_modules/abcjs/dist/abcjs-basic-min.js ../../vendor/abcjs.min.js

rm -rf node_modules/
