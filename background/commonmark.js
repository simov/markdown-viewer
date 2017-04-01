
md.commonmark = {
  defaults: {
    safe: false,
    smart: false,
    sourcepos: false
  },
  description: {
    safe: 'Raw HTML will not be rendered',
    smart: 'Straight quotes will be made curly, -- will be changed to an en dash, --- will be changed to an em dash, and ... will be changed to ellipses',
    sourcepos: ''
  },
  compile: (markdown, sendResponse) => {
    chrome.storage.sync.get('commonmark', (res) => {
      var reader = new commonmark.Parser()
      var writer = new commonmark.HtmlRenderer(res.commonmark)
      var parsed = reader.parse(markdown)
      var html = writer.render(parsed)
      sendResponse({message: 'html', html})
    })
  }
}
