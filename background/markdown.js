
var md = {
  // marked
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
    chrome.storage.sync.get((res) => {
      marked.setOptions(res.compiler)

      marked(markdown, (err, html) => {
        if (err) throw err
        sendResponse({message: 'marked', marked: html})
      })
    })
  }
}
