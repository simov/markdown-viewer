
var fs = require('fs')
var path = require('path')

// prism-autoloader.js
var source = path.resolve(__dirname, process.argv[2])
var target = path.resolve(__dirname, process.argv[3])
fs.writeFileSync(
  target,
  fs.readFileSync(source, 'utf8')
    .replace(
      // https://github.com/PrismJS/prism/issues/3654
      'addScript(getLanguagePath(lang), function () {',
      'Prism.plugins.autoloader.addScript(lang, function () {'
    ),
  'utf8'
)
