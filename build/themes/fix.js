
var fs = require('fs')
var path = require('path')
var themes = path.resolve(__dirname, '../../themes/')

var css = fs.readFileSync(path.resolve(themes, 'mini.css'), 'utf8')

fs.writeFileSync(
  path.resolve(themes, 'mini.css'),
  css
    .replace('*,h5', 'body')
    .replace('*,html', 'body'),
  'utf8'
)
