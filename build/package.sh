#!/bin/bash

# exit if any of the intermediate steps fail
set -e

browser=$1
compilers=$2

if [ -z "$browser" ]; then
  echo "Specify target browser"
  echo "chrome, firefox"
  exit 1
fi

# set current working directory to directory of the shell script
cd "$(dirname "$0")"

# cleanup
rm -rf ../themes
rm -rf ../vendor
rm -f ../markdown-viewer.zip
rm -f ../background/index-compilers.js
mkdir -p ../themes
mkdir -p ../vendor

# build deps
sh bootstrap/build.sh
sh marked/build.sh
sh mathjax/build.sh
sh mdc/build.sh
sh mermaid/build.sh
sh mithril/build.sh
sh prism/build.sh
sh remark/build.sh
sh themes/build.sh

# copy files
mkdir -p tmp
mkdir -p tmp/markdown-viewer
cd ..
cp -r background content icons options popup themes vendor LICENSE build/tmp/markdown-viewer/

if [ "$browser" = "chrome" ]; then
  cp manifest.chrome.json build/tmp/markdown-viewer/manifest.json
  cp manifest.chrome.json manifest.json
elif [ "$browser" = "firefox" ]; then
  cp manifest.firefox.json build/tmp/markdown-viewer/manifest.json
  cp manifest.firefox.json manifest.json
fi

# archive the markdown-viewer folder itself
if [ "$browser" = "chrome" ]; then
  cd build/tmp/
  zip -r ../../markdown-viewer.zip markdown-viewer
  cd ..
# archive the contents of the markdown-viewer folder
elif [ "$browser" = "firefox" ]; then
  cd build/tmp/markdown-viewer/
  zip -r ../../../markdown-viewer.zip .
  cd ../../
fi

# cleanup
rm -rf tmp/

# compilers
if [ "$compilers" = "compilers" ]; then
  sh compilers/build.sh
fi
