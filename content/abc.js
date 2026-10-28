var abc = (() => {
  var loaded = false

  var walk = (regex, string, result = [], match = regex.exec(string)) =>
    !match ? result : walk(regex, string, result.concat(match[1]))

  return {
    render: () => {
      var definitions = walk(/<pre><code class="abc">([\s\S]+?)<\/code><\/pre>/gi, state.html)

      Array.from(document.querySelectorAll('pre code.abc')).forEach((block, index) => {
        try {
          var source = definitions[index] || block.textContent
          var host = document.createElement('div')
          host.className = 'abc-container md-copy-host'
          host.dataset.mdCopySource = source
          block.parentElement.replaceWith(host)
          ABCJS.renderAbc(host, source, {})
        }
        catch (err) {
          console.error('Failed to render ABC notation:', err)
        }
      })

      loaded = true
    }
  }
})()
