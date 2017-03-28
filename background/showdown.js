
md.showdown = {
  defaults: {
    name: 'showdown',
    options: null, // see below
    flavor: 'github'
  },
  flavor: (name) => {
    var options = showdown.getDefaultOptions()
    var flavor = showdown.getFlavorOptions(name)
    var result = {}
    for (var key in options) {
      result[key] = (flavor[key] !== undefined) ? flavor[key] : options[key]
    }
    return result
  },
  compile: (markdown, sendResponse) => {
    chrome.storage.sync.get('compiler', (res) => {
      var converter = new showdown.Converter(res.compiler.options)
      var html = converter.makeHtml(markdown)
      sendResponse({message: 'html', html})
    })
  }
}

md.showdown.defaults.options = md.showdown.flavor('github')
