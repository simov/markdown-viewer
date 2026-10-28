
var MathJax = {
  loader: {
    pathFilters: [
      ({name}) => name.startsWith('[tex]') ? false : true // keep the name
    ],
    require: (path) => path.startsWith('[tex]') ?
      chrome.runtime.sendMessage({
        message: 'mathjax',
        extension: path.replace('[tex]/', '')
      }) : null
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
