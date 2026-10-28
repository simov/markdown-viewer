
var mmd = (() => {
  var loaded = false

  var walk = (regex, string, result = [], match = regex.exec(string)) =>
    !match ? result : walk(regex, string, result.concat(match[1]))

  return {
    render: () => {
      if (loaded) {
        var definitions = walk(/<pre><code class="mermaid">([\s\S]+?)<\/code><\/pre>/gi, state.html)

        Array.from(document.querySelectorAll('pre code.mermaid')).forEach((diagram, index) => {
          diagram.removeAttribute('data-processed')
          diagram.innerHTML = definitions[index]
        })
      }
      var theme =
        state._themes[state.theme] === 'dark' ||
        (state._themes[state.theme] === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? 'dark' : 'default'
      mermaid.initialize({theme})
      mermaid.init({theme}, 'code.mermaid')
      loaded = true

      var diagrams = Array.from(document.querySelectorAll('code.mermaid'))
      var timeout = setInterval(() => {
        var svg = Array.from(document.querySelectorAll('pre code.mermaid svg'))
        if (diagrams.length === svg.length) {
          clearInterval(timeout)
          svg.forEach((diagram) => {
            var panzoom = Panzoom(diagram, {canvas: true})
            diagram.parentElement.parentElement.addEventListener('wheel', (e) => {
              if (!e.shiftKey) return
              panzoom.zoomWithWheel(e)
            })
          })
        }
      }, 50)
    }
  }
})()
