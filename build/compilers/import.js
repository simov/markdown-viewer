
var fs = require('fs')
var path = require('path')

var fpath = {
  background: path.resolve(__dirname, '../../background/index.js'),
  compilers: path.resolve(__dirname, '../../background/index-compilers.js'),
  manifest: path.resolve(__dirname, '../../manifest.json'),
}

var compilers = `
importScripts('/vendor/showdown.min.js')
importScripts('/vendor/markdown-it.min.js')
importScripts('/vendor/remarkable.min.js')
importScripts('/vendor/commonmark.min.js')
importScripts('/background/compilers/showdown.js')
importScripts('/background/compilers/markdown-it.js')
importScripts('/background/compilers/remarkable.js')
importScripts('/background/compilers/commonmark.js')
`

// background/index-compilers.js
var source = fs.readFileSync(fpath.background, 'utf8')
var lines = source.split('\n')
fs.writeFileSync(
  fpath.compilers,
  lines.slice(0, 5).concat(compilers.split('\n')).concat(lines.slice(6)).join('\n'),
  'utf8'
)

// manifest.json
var source = fs.readFileSync(fpath.manifest, 'utf8')
fs.writeFileSync(
  fpath.manifest,
  source.replace('/background/index.js', '/background/index-compilers.js'),
  'utf8'
)
