
var common = require('rollup-plugin-commonjs')
var resolve = require('rollup-plugin-node-resolve')


export default {

  context: 'window',
  moduleContext: {id: 'window'},

  plugins: [
    common(),
    resolve(),
  ],

  output: {
    format: 'iife',
    name: 'mdc',
  },
}
