#!/bin/bash

cd "$(dirname "$0")"

npm ci 2> /dev/null || npm i

cp node_modules/wavedrom/wavedrom.min.js ../../vendor/wavedrom.min.js
cp node_modules/wavedrom/skins/default.js ../../vendor/wavedrom-skin.min.js

rm -rf node_modules/
