
var fs = require('fs')
var path = require('path')
var terser = require('terser')
var csso = require('csso')

var js = async () => {
  // prism.min.js
  var prism = fs.readFileSync(
    path.resolve(__dirname, 'node_modules/prismjs/prism.js'),
    'utf8'
  )
  fs.writeFileSync(
    path.resolve(__dirname, 'tmp/prism.min.js'),
    (await terser.minify(prism, {format: {comments: false}})).code,
    'utf8'
  )

  // prism-autoloader.min.js
  var autoloader = fs.readFileSync(
    path.resolve(__dirname, 'node_modules/prismjs/plugins/autoloader/prism-autoloader.js'),
    'utf8'
  ).replace(
    // https://github.com/PrismJS/prism/issues/3654
    'addScript(getLanguagePath(lang), function () {',
    'Prism.plugins.autoloader.addScript(lang, function () {'
  )
  fs.writeFileSync(
    path.resolve(__dirname, 'tmp/prism-autoloader.min.js'),
    (await terser.minify(autoloader, {format: {comments: false}})).code,
    'utf8'
  )
}

var css = () => {
  // prism.min.css
  var source = fs.readFileSync(
    path.resolve(__dirname, 'node_modules/prismjs/themes/prism.css'),
    'utf8'
  )
  fs.writeFileSync(
    path.resolve(__dirname, 'tmp/prism.min.css'),
    csso.minify(source).css
      .replace('background:0 0;', '')
      .replace('background:#f5f2f0', '')
      .replace('border-radius:.3em', '')
      .replace('padding:1em;', '')
      .replace('margin:.5em 0;', '')
      .replace('background:rgba(255,255,255,.5)', ''),
    'utf8'
  )

  // prism-okaidia.min.css
  var source = fs.readFileSync(
    path.resolve(__dirname, 'node_modules/prismjs/themes/prism-okaidia.css'),
    'utf8'
  )
  fs.writeFileSync(
    path.resolve(__dirname, 'tmp/prism-okaidia.min.css'),
    csso.minify(source).css
      .replace('background:0 0;', '')
      .replace('background:#272822', '')
      .replace('border-radius:.3em', '')
      .replace('padding:1em;', '')
      .replace('margin:.5em 0;', ''),
    'utf8'
  )
}

;(async () => {
  await js()
  css()
})()
