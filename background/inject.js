md.inject = ({storage: {state}}) => (id) => {

  var payload = {
    theme: state.theme,
    raw: state.raw,
    themes: state.themes,
    content: state.content,
    compiler: state.compiler,
    custom: state.custom,
    icon: state.settings.icon,
    markdown: '',
  }

  var paintStarted = false

  var paint = () => {
    if (paintStarted) {
      return
    }
    var next = () => {
      if (paintStarted) {
        return
      }
      paintStarted = true

      chrome.scripting.insertCSS({
        target: {tabId: id},
        files: [
          '/content/index.css',
          '/content/themes.css',
        ]
      })

      chrome.scripting.executeScript({
        target: {tabId: id},
        files: [
          '/content/umd-shim.js',
          '/vendor/mithril.min.js',
          state.content.syntax && ['/vendor/prism.min.js', '/vendor/prism-autoloader.min.js', '/content/prism.js'],
          state.content.emoji && '/content/emoji.js',
          state.content.mermaid && ['/vendor/mermaid.min.js', '/vendor/panzoom.min.js', '/content/mermaid.js'],
          state.content.plotly && ['/vendor/plotly.min.js', '/content/plotly.js'],
          state.content.abc && ['/vendor/abcjs.min.js', '/content/abc.js'],
          state.content.vegalite && [
            '/vendor/vega.min.js',
            '/vendor/vega-interpreter-polyfill.js',
            '/vendor/vega-interpreter.min.js',
            '/vendor/vega-lite.min.js',
            '/vendor/vega-embed.min.js',
            '/content/vegalite.js',
          ],
          state.content.graphviz && ['/vendor/graphviz.min.js', '/content/graphviz.js'],
          state.content.wavedrom && ['/vendor/wavedrom.min.js', '/vendor/wavedrom-skin.min.js', '/content/wavedrom.js'],
          state.content.csv && '/content/csv.js',
          state.content.mathjax && ['/content/mathjax.js', '/vendor/mathjax/tex-mml-chtml.js'],
          '/content/copy.js',
          '/content/index.js',
          '/content/scroll.js',
          state.content.autoreload && '/content/autoreload.js',
        ].filter(Boolean).flat(),
        injectImmediately: true
      })
    }

    var task
    try {
      task = chrome.scripting.executeScript({
        target: {tabId: id},
        args: [payload],
        func: (_args) => {
          var pre = document.querySelector('pre')
          if (pre) {
            pre.style.visibility = 'hidden'
          }
          window.__mdViewerShown = false
          args = _args
        },
        injectImmediately: true
      }, next)
    }
    catch (err) {
      next()
      return
    }

    if (task && typeof task.then === 'function') {
      task.then(next).catch(next)
    }
  }

  var readMarkdown = (attempt, finish) => {
    var settled = false
    var done = (markdown) => {
      if (settled) {
        return
      }
      settled = true
      finish(markdown)
    }

    var handle = (res) => {
      var markdown = res && res[0] && typeof res[0].result === 'string' ? res[0].result : ''
      if (markdown.trim() || attempt >= 24) {
        done(markdown)
      }
      else {
        setTimeout(() => readMarkdown(attempt + 1, finish), 50)
      }
    }

    var task
    try {
      task = chrome.scripting.executeScript({
        target: {tabId: id},
        world: 'MAIN',
        injectImmediately: true,
        func: () => {
          var pre = document.querySelector('pre')
          if (pre && pre.innerText && pre.innerText.trim()) {
            return pre.innerText
          }
          return document.body ? document.body.innerText : ''
        }
      }, handle)
    }
    catch (err) {
      done('')
      return
    }

    if (task && typeof task.then === 'function') {
      task.then(handle).catch(() => {
        if (attempt >= 24) {
          done('')
        }
        else {
          setTimeout(() => readMarkdown(attempt + 1, finish), 50)
        }
      })
    }
  }

  var markdownReady = false
  readMarkdown(0, (markdown) => {
    if (markdownReady) {
      return
    }
    markdownReady = true
    payload.markdown = markdown
    paint()
  })
}
