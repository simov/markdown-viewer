
md.inject = ({storage: {state}}) => (id) => {

  chrome.scripting.executeScript({
    target: {tabId: id},
    args: [{
      theme: state.theme,
      raw: state.raw,
      themes: state.themes,
      content: state.content,
      compiler: state.compiler,
    }],
    func: (_args) => {
      document.querySelector('pre').style.visibility = 'hidden'
      args = _args
    },
    injectImmediately: true
  })

  chrome.scripting.insertCSS({
    target: {tabId: id},
    files: [
      '/content/index.css',
    ]
  })

  chrome.scripting.executeScript({
    target: {tabId: id},
    files: [
      '/vendor/mithril.min.js',
      '/vendor/prism.min.js',
      state.content.emoji && '/content/emoji.js',
      state.content.mermaid && ['/vendor/mermaid.min.js', '/content/mermaid.js'],
      '/content/index.js',
    ].filter(Boolean).flat(),
    injectImmediately: true
  })

}
