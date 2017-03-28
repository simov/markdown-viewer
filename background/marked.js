
var md = {}

md.marked = {
  defaults: {
    name: 'marked',
    options: {
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: false,
      sanitize: false,
      smartLists: false,
      langPrefix: 'language-', // prism
      smartypants: false
    }
  },
  compile: (markdown, sendResponse) => {
    chrome.storage.sync.get('compiler', (res) => {
      marked.setOptions(res.compiler.options)
      marked(markdown, (err, html) => {
        if (err) throw err
        sendResponse({message: 'html', html})
      })
    })
  }
}
