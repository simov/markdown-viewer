#!/bin/bash
cd "$(dirname "$0")"
npm ci 2> /dev/null || npm i
cp node_modules/docx-preview/dist/docx-preview.min.js ../../vendor/docx-preview.min.js
rm -rf node_modules/
