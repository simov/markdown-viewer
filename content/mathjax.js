
var MathJax = {
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
