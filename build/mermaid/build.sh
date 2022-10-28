#!/bin/bash

# set current working directory to directory of the shell script
cd "$(dirname "$0")"

curl https://cdnjs.cloudflare.com/ajax/libs/mermaid/9.1.6/mermaid.min.js --output ../../vendor/mermaid.min.js