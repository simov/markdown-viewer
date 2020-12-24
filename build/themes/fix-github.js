
var fs = require('fs')

var github = fs.readFileSync('./themes/github.css', 'utf8')
fs.writeFileSync(
  'themes/github.css',
  github.replace(/\.markdown-body :root/g, ':root'),
  'utf8'
)
