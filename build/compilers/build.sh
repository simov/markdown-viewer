#!/bin/bash

# set current working directory to directory of the shell script
cd "$(dirname "$0")"

curl https://cdnjs.cloudflare.com/ajax/libs/showdown/2.1.0/showdown.min.js --output ../../vendor/showdown.min.js
curl https://cdnjs.cloudflare.com/ajax/libs/commonmark/0.29.3/commonmark.min.js --output ../../vendor/commonmark.min.js
curl https://cdnjs.cloudflare.com/ajax/libs/remarkable/1.7.4/remarkable.min.js --output ../../vendor/remarkable.min.js

node import.js
