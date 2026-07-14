
var MathJax = {
  loader: {
    pathFilters: [
      ({name}) => name.startsWith('[tex]') ? false : true // keep the name
    ],
    require: (path) => {
      if (path.startsWith('[tex]')) {
        var extension = path.replace('[tex]/', '')
        if (location.protocol.endsWith('-extension:')) {
          var script = document.createElement('script')
          script.src = `/vendor/mathjax/extensions/${extension}.js`
          document.body.appendChild(script)
          return null
        }
        return chrome.runtime.sendMessage({
          message: 'mathjax',
          extension
        })
      }
      return null
    }
  },
  tex: {
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)'],
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]'],
    ],
    processEscapes: true
  },
  showMathMenu: false,
  showProcessingMessages: false,
  messageStyle: 'none',
  skipStartupTypeset: true, // disable initial rendering
  positionToHash: false,
  options: {
    ignoreHtmlClass: 'tex2jax-ignore'
  },
  chtml: {
    fontURL: chrome.runtime.getURL('/vendor/mathjax/fonts')
  },
  startup: {
    typeset: false
  }
}

var mj = {
  loaded: false,
  render: () => {
    mj.loaded = false
    MathJax.typesetPromise().then(() => {
      setTimeout(() => mj.loaded = true, 20)
    })
  }
}
