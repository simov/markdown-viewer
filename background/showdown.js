
md.showdown = {
  defaults: null, // see below,
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
    chrome.storage.sync.get('showdown', (res) => {
      var converter = new showdown.Converter(res.showdown)
      var html = converter.makeHtml(markdown)
      sendResponse({message: 'html', html})
    })
  }
}

md.showdown.defaults = md.showdown.flavor('github')
