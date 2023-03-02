#!/bin/bash

# set current working directory to directory of the shell script
cd "$(dirname "$0")"

git clone --depth 1 --branch 3.2.2 https://github.com/mathjax/MathJax.git tmp

# https://github.com/mathjax/MathJax#reducing-the-size-of-the-components-directory
mkdir -p ../../vendor/mathjax
cp tmp/es5/tex-mml-chtml.js ../../vendor/mathjax

mkdir -p ../../vendor/mathjax/fonts
cp tmp/es5/output/chtml/fonts/woff-v2/*.woff ../../vendor/mathjax/fonts

mkdir -p ../../vendor/mathjax/extensions
cp tmp/es5/input/tex/extensions/*.js ../../vendor/mathjax/extensions/

rm -rf tmp/
