
var mmd = {
  loaded: false,
  refresh: () => {
    if (!mmd.loaded) {
      return
    }

    var walk = (regex, string, result = [], match = regex.exec(string)) =>
      !match ? result : walk(regex, string, result.concat(match[1]))

    var definitions = walk(/<pre><code class="mermaid">([\s\S]+?)<\/code><\/pre>/gi, state.html)

    Array.from(document.querySelectorAll('pre code.mermaid')).forEach((diagram, index) => {
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
    mermaid.init({}, 'code.mermaid')
    mmd.loaded = true
  }
}
