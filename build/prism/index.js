
var fs = require('fs')
var path = require('path')
var vm = require('vm')
var uglify = require('uglify-js')


// load prism languages
var include = (file) => {
  var fpath = path.resolve(__dirname, `../../node_modules/prismjs/${file}.js`)
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
config['markdown-viewer'] = config['markdown-viewer'].sort()
// add any new
config.all = Object.keys(languages)

fs.writeFileSync(path.resolve(__dirname, 'prism.json'),
  JSON.stringify(config, null, 2), 'utf8')


// build prism.min.js
var core = fs.readFileSync(
  path.resolve(__dirname, '../../node_modules/prismjs/prism.js'), 'utf8')
// core
var source = uglify.minify(core, {compress: {}, mangle: true}).code
// components
source += config['markdown-viewer'].reduce((source, component) => (
  source += fs.readFileSync(path.resolve(__dirname,
    `../../node_modules/prismjs/components/prism-${component}.min.js`), 'utf8') + '\n',
  source
), '')

fs.writeFileSync(path.resolve(__dirname, '../../vendor/prism.min.js'), source, 'utf8')


// print the excluded ones and their corresponding files sizes
console.log('Excluded:')
config.all
  .filter((component) => !config['markdown-viewer'].includes(component))
  .map((component) => console.log(
    component, '\t\t\t',
    fs.lstatSync(path.resolve(__dirname,
      `../../node_modules/prismjs/components/prism-${component}.min.js`)).size
  ))


// build css
var csso = require('csso')

var source = fs.readFileSync(
  path.resolve(__dirname, '../../node_modules/prismjs/themes/prism.css'),
  'utf8'
)

fs.writeFileSync(
  path.resolve(__dirname, '../../vendor/prism.min.css'),
  csso.minify(source).css,
  'utf8'
)
