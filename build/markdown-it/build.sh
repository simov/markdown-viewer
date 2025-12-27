#!/bin/bash

# set current working directory to directory of the shell script
cd "$(dirname "$0")"

# before
npm ci 2> /dev/null || npm i

# copy
mkdir -p ../../vendor/markdown-it
cp node_modules/markdown-it/dist/markdown-it.min.js ../../vendor/markdown-it/markdown-it.min.js
cp node_modules/markdown-it-abbr/dist/markdown-it-abbr.js ../../vendor/markdown-it/markdown-it-abbr.js
cp node_modules/markdown-it-anchor/dist/markdownItAnchor.umd.js ../../vendor/markdown-it/markdown-it-anchor.js
cp node_modules/markdown-it-attrs/markdown-it-attrs.browser.js ../../vendor/markdown-it/markdown-it-attrs.js
cp node_modules/markdown-it-cjk-breaks/dist/markdown-it-cjk-breaks.js ../../vendor/markdown-it/markdown-it-cjk-breaks.js
cp node_modules/markdown-it-deflist/dist/markdown-it-deflist.js ../../vendor/markdown-it/markdown-it-deflist.js
cp node_modules/markdown-it-footnote/dist/markdown-it-footnote.js ../../vendor/markdown-it/markdown-it-footnote.js
cp node_modules/markdown-it-ins/dist/markdown-it-ins.js ../../vendor/markdown-it/markdown-it-ins.js
cp node_modules/markdown-it-mark/dist/markdown-it-mark.js ../../vendor/markdown-it/markdown-it-mark.js
cp node_modules/markdown-it-sub/dist/markdown-it-sub.js ../../vendor/markdown-it/markdown-it-sub.js
cp node_modules/markdown-it-sup/dist/markdown-it-sup.js ../../vendor/markdown-it/markdown-it-sup.js
cp node_modules/markdown-it-task-lists/dist/markdown-it-task-lists.js ../../vendor/markdown-it/markdown-it-task-lists.js

# after
rm -rf node_modules/
