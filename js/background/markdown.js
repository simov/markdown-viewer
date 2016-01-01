
var md = (function () {
  // marked
  var defaults = {
    gfm: true,
    // highlight: null,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false,
    langPrefix: 'language-'//prism
  }

  function compile (markdown, sendResponse) {
    chrome.storage.sync.get(function (sync) {
      marked.setOptions(sync.options)

      marked(markdown, function (err, html) {
        if (err) throw err
        // prism fix
        html = html.replace(/language-html/g, 'language-markup')
        html = html.replace(/language-js/g, 'language-javascript')

        sendResponse({message: 'marked', marked: html})
      })
    })
  }

  return {
    defaults: defaults,
    compile: compile
  }
}())
