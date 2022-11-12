
var fs = require('fs')
var path = require('path')
var vm = require('vm')
var terser = require('terser')
var csso = require('csso')


var _config = () => {
  // load prism languages
  var include = (file) => {
    var fpath = path.resolve(__dirname, `node_modules/prismjs/${file}.js`)
    var source = fs.readFileSync(fpath, 'utf8')
    var ctx = vm.createContext()
    vm.runInContext(source, ctx)
    return ctx
  }

  var {components: {languages}} = include('components')
  delete languages.meta

  // update prism languages config
  var config = require('./prism.json')
  // sort the included ones
  config.included = config.included.sort()
  // update excluded
  config.excluded = Object.keys(languages)
    .filter((lang) => !config.included.includes(lang))
    .sort()
  // update config
  fs.writeFileSync(
    path.resolve(__dirname, 'prism.json'),
    JSON.stringify(config, null, 2),
    'utf8'
  )

  return config
}

// prism.min.js
var js = async (config) => {
  var core = fs.readFileSync(
    path.resolve(__dirname, 'node_modules/prismjs/prism.js'), 'utf8'
  )

  var source =
    // core
    (await terser.minify(core, {format: {comments: false}})).code +
    // components
    config.included.reduce((all, key) => (
      all += fs.readFileSync(path.resolve(__dirname,
        `node_modules/prismjs/components/prism-${key}.min.js`), 'utf8') + '\n',
      all
    ), '')

  fs.writeFileSync(path.resolve(__dirname, 'tmp/prism.min.js'), source, 'utf8')
}

// prism.min.css
var css = () => {
  var source = fs.readFileSync(
    path.resolve(__dirname, 'node_modules/prismjs/themes/prism.css'),
    'utf8'
  )

  fs.writeFileSync(
    path.resolve(__dirname, 'tmp/prism.min.css'),
    csso.minify(source).css
      .replace('background:0 0;', '')
      .replace('background:#f5f2f0', '')
      .replace('border-radius:.3em', '')
      .replace('padding:1em;', '')
      .replace('margin:.5em 0;', '')
      .replace('background:rgba(255,255,255,.5)', ''),
    'utf8'
  )

  var source = fs.readFileSync(
    path.resolve(__dirname, 'node_modules/prismjs/themes/prism-okaidia.css'),
    'utf8'
  )

  fs.writeFileSync(
    path.resolve(__dirname, 'tmp/prism-okaidia.min.css'),
    csso.minify(source).css
      .replace('background:0 0;', '')
      .replace('background:#272822', '')
      .replace('border-radius:.3em', '')
      .replace('padding:1em;', '')
      .replace('margin:.5em 0;', ''),
    'utf8'
  )
}

var stats = (config) => {
  var included = config.included
    .map((name) => ({
      name,
      size: fs.lstatSync(path.resolve(__dirname,
        `node_modules/prismjs/components/prism-${name}.min.js`)).size
    }))

  var excluded = config.excluded
    .map((name) => ({
      name,
      size: fs.lstatSync(path.resolve(__dirname,
        `node_modules/prismjs/components/prism-${name}.min.js`)).size
    }))

  console.log('Excluded:')
  excluded // sorted by name
    // .sort((a, b) => b.size - a.size) // sorted by size
    .forEach(({name, size}) => console.log(name, '\t\t\t', size))

  console.log('Included:', included.length, included.reduce((total, {size}) => total += size, 0))
  console.log('Excluded:', excluded.length, excluded.reduce((total, {size}) => total += size, 0))
}

;(async () => {
  var config = _config()
  // prism.min.js
  await js(config)
  // prism.min.css
  css()
  // print stats
  stats(config)
})()
