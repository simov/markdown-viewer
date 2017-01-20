
var md = {
  // marked
  defaults: {
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    // sanitizer: null,
    // mangle: true, // mangling of email addresses
    smartLists: false,
    // silent: false, // report errors
    // highlight: null,
    langPrefix: 'language-', // prism
    smartypants: false
    // headerPrefix: '',
    // renderer:
    // xhtml: false // handle self closing HTML tags
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
