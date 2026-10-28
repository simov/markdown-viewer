#!/bin/bash

# exit if any of the intermediate steps fail
set -e

# set current working directory to directory of the shell script
cd "$(dirname "$0")"

# cleanup
rm -rf ../themes
rm -rf ../vendor
rm -f ../markdown-viewer.zip
mkdir -p ../themes
mkdir -p ../vendor

# build deps
sh bootstrap/build.sh
sh csso/build.sh
sh markdown-it/build.sh
sh marked/build.sh
sh mathjax/build.sh
sh mdc/build.sh
sh mermaid/build.sh
sh mithril/build.sh
sh panzoom/build.sh
sh plotly/build.sh
sh abc/build.sh
sh vegalite/build.sh
sh graphviz/build.sh
sh wavedrom/build.sh
sh prism/build.sh
sh remark/build.sh
sh themes/build.sh

# copy files
mkdir -p tmp
mkdir -p tmp/markdown-viewer
cd ..
cp -r background content icons options popup themes vendor LICENSE manifest.json build/tmp/markdown-viewer/

# archive the contents of the markdown-viewer folder
cd build/tmp/markdown-viewer/
zip -r ../../../markdown-viewer.zip .
cd ../../

# cleanup
rm -rf tmp/
