
var fs = require('fs')
var path = require('path')

// prism.min.css
var file = path.resolve(__dirname, process.argv[2])
fs.writeFileSync(
  file,
  fs.readFileSync(file, 'utf8')
    .replace('background:0 0;', '')
    .replace('background:#f5f2f0', '')
    .replace('border-radius:.3em', '')
    .replace('padding:1em;', '')
    .replace('margin:.5em 0;', '')
    .replace('background:rgba(255,255,255,.5)', ''),
  'utf8'
)

// prism-okaidia.min.css
var file = path.resolve(__dirname, process.argv[3])
fs.writeFileSync(
  file,
  fs.readFileSync(file, 'utf8')
    .replace('background:0 0;', '')
    .replace('background:#272822', '')
    .replace('border-radius:.3em', '')
    .replace('padding:1em;', '')
    .replace('margin:.5em 0;', ''),
  'utf8'
)
