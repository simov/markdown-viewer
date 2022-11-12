
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
  }
}
