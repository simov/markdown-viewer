
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
  loading: false,
  render: () => {
    if (mj.loading) {
      return
    }
    mj.loading = true
    var timeout = setInterval(() => {
      if (!!MathJax) {
        clearInterval(timeout)
        MathJax.typesetPromise()
      }
    }, 0)
  }
}
