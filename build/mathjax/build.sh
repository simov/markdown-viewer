#!/bin/bash

# set current working directory to directory of the shell script
cd "$(dirname "$0")"

# before
npm ci 2> /dev/null || npm i

# copy
# https://github.com/mathjax/MathJax#reducing-the-size-of-the-components-directory

# tex-mml-chtml.js
mkdir -p ../../vendor/mathjax
cp node_modules/mathjax/es5/tex-mml-chtml.js ../../vendor/mathjax

# extensions/
mkdir -p ../../vendor/mathjax/extensions
cp node_modules/mathjax/es5/input/tex/extensions/*.js ../../vendor/mathjax/extensions/

# fonts/
mkdir -p ../../vendor/mathjax/fonts
cp node_modules/mathjax/es5/output/chtml/fonts/woff-v2/*.woff ../../vendor/mathjax/fonts

# after
rm -rf node_modules/
