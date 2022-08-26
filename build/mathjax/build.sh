#!/bin/bash

# set current working directory to directory of the shell script
cd "$(dirname "$0")"

git clone --depth 1 --branch 3.2.2 https://github.com/mathjax/MathJax.git tmp

# https://github.com/mathjax/MathJax#reducing-the-size-of-the-components-directory
rm -rf tmp/es5/a11y/
rm -rf tmp/es5/adaptors/
rm -rf tmp/es5/sre/

rm -f tmp/es5/mml-chtml.js
rm -f tmp/es5/mml-svg.js
rm -f tmp/es5/tex-chtml-full.js
rm -f tmp/es5/tex-chtml-full-speech.js
rm -f tmp/es5/tex-chtml.js
rm -f tmp/es5/tex-mml-svg.js
rm -f tmp/es5/tex-svg-full.js
rm -f tmp/es5/tex-svg.js

rm -rf tmp/es5/output/svg/
rm -f tmp/es5/output/svg.js

mv tmp/es5 ../../vendor/mathjax
rm -rf tmp/
