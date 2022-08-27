
;(() => {
  var timeout = setInterval(() => {
    if (!!(window.mermaid && mermaid.init)) {
      clearInterval(timeout)
      mermaid.init({}, 'code.language-mmd, code.language-mermaid')
    }
  }, 50)
})()
