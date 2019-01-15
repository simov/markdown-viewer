#!/bin/bash

# before
cd build/remark/
rm -rf tmp/
mkdir tmp

# bundle
npx browserify index.js -s remark > tmp/remark.js
# minify
npx terser --compress --mangle -- tmp/remark.js > tmp/remark.min.js

# copy
cp tmp/remark.min.js ../../vendor/

# after
rm -r tmp/
