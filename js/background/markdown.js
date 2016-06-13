
var md = (() => {
  // marked
  var defaults = {
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
  }

  function compile (markdown, sendResponse) {
    chrome.storage.sync.get((sync) => {
      marked.setOptions(sync.options)

      marked(markdown, (err, html) => {
        if (err) throw err
        sendResponse({message: 'marked', marked: html})
      })
    })
  }

  return {
    defaults: defaults,
    compile: compile
  }
})()
