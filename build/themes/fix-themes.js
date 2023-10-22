
var fs = require('fs')
var path = require('path')
var themes = path.resolve(__dirname, '../../themes/')

fs.writeFileSync(
  path.resolve(themes, 'mini.css'),
  fs.readFileSync(path.resolve(themes, 'mini.css'), 'utf8')
    .replace('*,h5', 'body')
    .replace('*,html', 'body'),
  'utf8'
)

fs.writeFileSync(
  path.resolve(themes, 'latex.css'),
  fs.readFileSync(path.resolve(themes, 'latex.css'), 'utf8')
    .replace('scroll-behavior:smooth', ''),
  'utf8'
)

fs.writeFileSync(
  path.resolve(themes, 'simple.css'),
  fs.readFileSync(path.resolve(themes, 'simple.css'), 'utf8')
    .replace('scroll-behavior:smooth', ''),
  'utf8'
)
