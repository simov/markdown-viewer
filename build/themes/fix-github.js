
var fs = require('fs')
var path = require('path')

var fpath = path.resolve(__dirname, 'markdown-themes/github.css')

var theme = fs.readFileSync(fpath, 'utf8')
  .replace(/\.markdown-body :root/g, ':root')

fs.writeFileSync(fpath, theme, 'utf8')
