#!/bin/bash

# set current working directory to directory of the shell script
cd "$(dirname "$0")"

curl https://cdnjs.cloudflare.com/ajax/libs/mithril/1.1.6/mithril.min.js --output ../../vendor/mithril.min.js
