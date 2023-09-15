
var common = require('@rollup/plugin-commonjs')
var resolve = require('@rollup/plugin-node-resolve')
var node = require('rollup-plugin-polyfill-node')


export default {
  context: 'window',
  moduleContext: {id: 'window'},

  plugins: [
    common(),
    resolve(),
    node(),
  ],

  output: {
    format: 'iife',
    name: 'marked',
  },
}
