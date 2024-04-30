#!/bin/bash

browser=$1

# set current working directory to directory of the shell script
cd "$(dirname "$0")"

# before
npm ci 2> /dev/null || npm i
git -c https.proxy="" clone --depth 1 --branch v0.1.0 https://github.com/gadenbuie/cleanrmd.git
mkdir -p ../../themes

# minify

# github
npx csso --input node_modules/github-markdown-css/github-markdown-light.css --output ../../themes/github.css
npx csso --input node_modules/github-markdown-css/github-markdown-dark.css --output ../../themes/github-dark.css

# themes
npx csso --input cleanrmd/inst/resources/almond/almond.css --output ../../themes/almond.css
npx csso --input cleanrmd/inst/resources/awsm.css/awsm.css --output ../../themes/awsm.css
npx csso --input cleanrmd/inst/resources/axist/axist.css --output ../../themes/axist.css
npx csso --input cleanrmd/inst/resources/bamboo/bamboo.css --output ../../themes/bamboo.css
npx csso --input cleanrmd/inst/resources/bullframe/bullframe.css --output ../../themes/bullframe.css
npx csso --input cleanrmd/inst/resources/holiday/holiday.css --output ../../themes/holiday.css
npx csso --input cleanrmd/inst/resources/kacit/kacit.css --output ../../themes/kacit.css
npx csso --input cleanrmd/inst/resources/latex.css/latex.css --output ../../themes/latex.css
# npx csso --input cleanrmd/inst/resources/markdown-air/markdown-air.css --output ../../themes/air.css
npx csso --input cleanrmd/inst/resources/markdown-modest/markdown-modest.css --output ../../themes/modest.css
npx csso --input cleanrmd/inst/resources/markdown-retro/markdown-retro.css --output ../../themes/retro.css
# npx csso --input cleanrmd/inst/resources/markdown-splendor/markdown-splendor.css --output ../../themes/splendor.css
npx csso --input cleanrmd/inst/resources/marx/marx.css --output ../../themes/marx.css
npx csso --input cleanrmd/inst/resources/minicss/minicss.css --output ../../themes/mini.css
npx csso --input cleanrmd/inst/resources/new.css/new.css --output ../../themes/new.css
npx csso --input cleanrmd/inst/resources/no-class/no-class.css --output ../../themes/no-class.css
npx csso --input cleanrmd/inst/resources/picocss/pico.css --output ../../themes/pico.css
npx csso --input cleanrmd/inst/resources/sakura/sakura.css --output ../../themes/sakura.css
npx csso --input cleanrmd/inst/resources/sakura-vader/sakura-vader.css --output ../../themes/sakura-vader.css
npx csso --input cleanrmd/inst/resources/semantic/semantic.css --output ../../themes/semantic.css
npx csso --input cleanrmd/inst/resources/simplecss/simple.css --output ../../themes/simple.css
npx csso --input cleanrmd/inst/resources/style-sans/style-sans.css --output ../../themes/style-sans.css
npx csso --input cleanrmd/inst/resources/style-serif/style-serif.css --output ../../themes/style-serif.css
npx csso --input cleanrmd/inst/resources/stylize/stylize.css --output ../../themes/stylize.css
npx csso --input cleanrmd/inst/resources/superstylin/superstylin.css --output ../../themes/superstylin.css
npx csso --input cleanrmd/inst/resources/tacit/tacit.css --output ../../themes/tacit.css
npx csso --input cleanrmd/inst/resources/vanilla/vanilla.css --output ../../themes/vanilla.css
npx csso --input cleanrmd/inst/resources/water/water.css --output ../../themes/water.css
npx csso --input cleanrmd/inst/resources/water-dark/water-dark.css --output ../../themes/water-dark.css
npx csso --input cleanrmd/inst/resources/writ/writ.css --output ../../themes/writ.css

# after
rm -rf node_modules/ cleanrmd/

node fix-themes.js $browser
