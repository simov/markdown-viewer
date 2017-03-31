
var md = {}

md.marked = {
  defaults: {
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: false,
    langPrefix: 'language-', // prism
    smartypants: false
  },
  compile: (markdown, sendResponse) => {
    chrome.storage.sync.get('marked', (res) => {
      var html = marked(markdown, res.marked)
      sendResponse({message: 'html', html})
    })
  }
}
