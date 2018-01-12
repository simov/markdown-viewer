
var sass = require('node-sass')
var csso = require('csso')

var rollup = require('rollup')
var common = require('rollup-plugin-commonjs')
var resolve = require('rollup-plugin-node-resolve')
var babel = require('babel-core')
var uglify = require('uglify-js')


module.exports = () => {

  var css = {
    compile: (file) =>
      sass.renderSync({
        file,
        includePaths: [
          'node_modules/'
        ]
      }).css
    ,
    minify: (data) =>
      csso.minify(data).css
    ,
    build: (file) =>
      css.minify(css.compile(file))
    ,
  }

  var js = {
    bundle: async (input) => {
      var options = {
        input,
        context: 'window',
        moduleContext: {id: 'window'},
        format: 'iife',
        name: 'mdc',
        plugins: [
          // common(),
          resolve(),
        ]
      }

      var bundle = await rollup.rollup(options)
      var bundled = await bundle.generate(options)

      return bundled.code
    }
    ,
    transpile: (code) => {
      var options = {
        presets: ['es2015'],
        // comments: false,
        // compact: true,
        // minified: true
      }

      var transpiled = babel.transform(code, options)

      return transpiled.code
    }
    ,
    minify: (code) => {
      var options = {
        compress: {},
        mangle: true
      }

      var minified = uglify.minify(code, options)

      return minified.code
    }
    ,
    build: (file) =>
      js.bundle(file)
        .then((code) => js.minify(js.transpile(code)))
    ,
  }

  return {css, js}
}
