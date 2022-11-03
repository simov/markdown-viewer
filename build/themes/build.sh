#!/bin/bash

# set current working directory to directory of the shell script
cd "$(dirname "$0")"

mkdir -p ../../themes

# https://github.com/sindresorhus/github-markdown-css
curl https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.1.0/github-markdown.min.css --output ../../themes/github.css
curl https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.1.0/github-markdown-dark.min.css --output ../../themes/github-dark.css

# https://github.com/gadenbuie/cleanrmd
git clone --depth 1 --branch v0.1.0 https://github.com/gadenbuie/cleanrmd.git

npm install
npx csso --input cleanrmd/inst/resources/almond/almond.css --output ../../themes/almond.css
npx csso --input cleanrmd/inst/resources/awsm.css/awsm.css --output ../../themes/awsm.css
npx csso --input cleanrmd/inst/resources/axist/axist.css --output ../../themes/axist.css
npx csso --input cleanrmd/inst/resources/bamboo/bamboo.css --output ../../themes/bamboo.css
npx csso --input cleanrmd/inst/resources/bullframe/bullframe.css --output ../../themes/bullframe.css
npx csso --input cleanrmd/inst/resources/holiday/holiday.css --output ../../themes/holiday.css
npx csso --input cleanrmd/inst/resources/kacit/kacit.css --output ../../themes/kacit.css
npx csso --input cleanrmd/inst/resources/latex.css/latex.css --output ../../themes/latex.css
npx csso --input cleanrmd/inst/resources/markdown-splendor/markdown-splendor.css --output ../../themes/markdown-splendor.css
npx csso --input cleanrmd/inst/resources/markdown-retro/markdown-retro.css --output ../../themes/markdown-retro.css
npx csso --input cleanrmd/inst/resources/markdown-air/markdown-air.css --output ../../themes/markdown-air.css
npx csso --input cleanrmd/inst/resources/markdown-modest/markdown-modest.css --output ../../themes/markdown-modest.css
npx csso --input cleanrmd/inst/resources/marx/marx.css --output ../../themes/marx.css
npx csso --input cleanrmd/inst/resources/minicss/minicss.css --output ../../themes/minicss.css
npx csso --input cleanrmd/inst/resources/new.css/new.css --output ../../themes/new.css
npx csso --input cleanrmd/inst/resources/no-class/no-class.css --output ../../themes/no-class.css
npx csso --input cleanrmd/inst/resources/picocss/pico.css --output ../../themes/pico.css
npx csso --input cleanrmd/inst/resources/sakura/sakura.css --output ../../themes/sakura.css
npx csso --input cleanrmd/inst/resources/sakura-vader/sakura-vader.css --output ../../themes/sakura-vader.css
npx csso --input cleanrmd/inst/resources/semantic/semantic.css --output ../../themes/semantic.css
npx csso --input cleanrmd/inst/resources/simplecss/simple.css --output ../../themes/simplecss.css
npx csso --input cleanrmd/inst/resources/style-sans/style-sans.css --output ../../themes/style-sans.css
npx csso --input cleanrmd/inst/resources/style-serif/style-serif.css --output ../../themes/style-serif.css
npx csso --input cleanrmd/inst/resources/stylize/stylize.css --output ../../themes/stylize.css
npx csso --input cleanrmd/inst/resources/superstylin/superstylin.css --output ../../themes/superstylin.css
npx csso --input cleanrmd/inst/resources/tacit/tacit.css --output ../../themes/tacit.css
npx csso --input cleanrmd/inst/resources/vanilla/vanilla.css --output ../../themes/vanilla.css
npx csso --input cleanrmd/inst/resources/water/water.css --output ../../themes/water.css
npx csso --input cleanrmd/inst/resources/water-dark/water-dark.css --output ../../themes/water-dark.css
npx csso --input cleanrmd/inst/resources/writ/writ.css --output ../../themes/writ.css

rm -rf cleanrmd/ node_modules/ package-lock.json
