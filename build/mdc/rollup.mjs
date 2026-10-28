
import common from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'


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
