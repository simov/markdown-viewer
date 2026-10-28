
var skipPrismLanguages = /^(?:abc|vegalite|vega-lite|vega|graphviz|dot|wavedrom|csv|tsv|plotly|mermaid|mmd)$/

Prism.plugins.autoloader.addScript = (language, done) => {
  if (skipPrismLanguages.test(language)) {
    done()
    return
  }
  chrome.runtime.sendMessage({
    message: 'prism',
    language
  }, () => done())
}

if (Prism.hooks) {
  Prism.hooks.add('before-sanity-check', (env) => {
    if (skipPrismLanguages.test(env.language)) {
      env.grammar = null
    }
  })
}
