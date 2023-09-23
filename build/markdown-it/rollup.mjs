
import common from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import node from 'rollup-plugin-polyfill-node'


export default {
  context: 'window',
  moduleContext: {id: 'window'},

  plugins: [
    common(),
    resolve(),
    json(),
    node(),
  ],

  output: {
    format: 'iife',
    name: 'mdit',
  },
}
