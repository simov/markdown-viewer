
var fs = require('fs')
var path = require('path')

// mermaid.min.js
var source = path.resolve(__dirname, process.argv[2])
var target = path.resolve(__dirname, process.argv[3])
fs.writeFileSync(
  target,
  fs.readFileSync(source, 'utf8')
    .replaceAll(
      // https://github.com/mermaid-js/mermaid/issues/5378
      // https://discourse.mozilla.org/t/cannot-inject-a-javascript-file-because-of-a-csp-limitations/128649
      'Function("return this")',
      '(() => globalThis)'
    ),
  'utf8'
)
