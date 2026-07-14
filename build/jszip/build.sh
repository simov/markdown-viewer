#!/bin/bash
cd "$(dirname "$0")"
npm ci 2> /dev/null || npm i
cp node_modules/jszip/dist/jszip.min.js ../../vendor/jszip.min.js
rm -rf node_modules/
