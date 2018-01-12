#!/usr/bin/env node

var fs = require('fs')
var path = require('path')


var write = (file, data) => {
  fs.writeFileSync(path.resolve(__dirname, '../../vendor/', file), data)
}


var mdc = require('./build')()

write('mdc.min.css', mdc.css.build(path.resolve(__dirname, 'mdc.scss')))

mdc.js.build(path.resolve(__dirname, 'mdc.js'))
.then((code) => {
  write('mdc.min.js', code)
})
