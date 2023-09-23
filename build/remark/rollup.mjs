
import common from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import node from 'rollup-plugin-polyfill-node'


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
    name: 'remark',
  },
}
