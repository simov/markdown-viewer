
var mmd = {
  loaded: false,
  refresh: () => {
    if (!mmd.loaded) {
      return
    }

    var walk = (regex, string, result = [], match = regex.exec(string)) =>
      !match ? result : walk(regex, string, result.concat(match[1]))

    var definitions = walk(/<pre><code class="language-(?:mermaid|mmd)">([\s\S]+?)<\/code><\/pre>/gi, state.html)

    Array.from(document.querySelectorAll('pre code.language-mermaid, pre code.language-mmd')).forEach((diagram, index) => {
      diagram.removeAttribute('data-processed')
      diagram.innerHTML = definitions[index]
    })

    mmd.render()
  },
  render: () => {
    mermaid.initialize({
      theme:
        state._themes[state.theme] === 'dark' ||
        (state._themes[state.theme] === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? 'dark' : 'default'
    })
    mermaid.init({}, 'code.language-mmd, code.language-mermaid')
    mmd.loaded = true
  }
}

;(() => {
  var timeout = setInterval(() => {
    if (!!(window.mermaid && mermaid.init)) {
      clearInterval(timeout)
      mmd.render()
    }
  }, 100)
})()
