#!/bin/bash

# set current working directory to directory of the shell script
cd "$(dirname "$0")"

# before
npm ci 2> /dev/null || npm i
mkdir -p tmp

# build

# prism.min.js
npx terser --compress --mangle -- node_modules/prismjs/prism.js > tmp/prism.min.js

# prism-autoloader.min.js
node fix-autoloader.js \
  node_modules/prismjs/plugins/autoloader/prism-autoloader.js \
  tmp/prism-autoloader.js
npx terser --compress --mangle -- tmp/prism-autoloader.js > tmp/prism-autoloader.min.js

# prism.min.css
# prism-okaidia.min.css
npx csso --input node_modules/prismjs/themes/prism.css --output tmp/prism.min.css
npx csso --input node_modules/prismjs/themes/prism-okaidia.css --output tmp/prism-okaidia.min.css
node fix-themes.js \
  tmp/prism.min.css \
  tmp/prism-okaidia.min.css

# copy
cp tmp/prism.min.js ../../vendor/
cp tmp/prism-autoloader.min.js ../../vendor/
cp tmp/prism.min.css ../../vendor/
cp tmp/prism-okaidia.min.css ../../vendor/
# languages
mkdir -p ../../vendor/prism/
cp node_modules/prismjs/components/prism-*.min.js ../../vendor/prism/

# after
rm -rf node_modules/ tmp/
