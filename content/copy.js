var cpy = (() => {
  var widgetSelector = [
    '.plotly-container',
    '.abc-container',
    '.vegalite-container',
    '.graphviz-container',
    '.wavedrom-container',
    '.md-table-wrap',
  ].join(', ')

  function decodeHtml(html) {
    var txt = document.createElement('textarea')
    txt.innerHTML = html
    return txt.value
  }

  function blockSources(html) {
    var sources = []
    var re = /<pre><code class="(?:(?:language-)?[^"\s]+[^"]*)">([\s\S]*?)<\/code><\/pre>/gi
    var match
    while ((match = re.exec(html))) {
      sources.push(decodeHtml(match[2]))
    }
    return sources
  }

  function targets() {
    var raw = document.querySelector('#_markdown')
    if (raw) {
      return [raw]
    }

    var root = document.querySelector('#_html')
    if (!root) {
      return []
    }

    return Array.from(root.querySelectorAll('pre, ' + widgetSelector)).filter((el) => {
      if (!el.matches('pre')) {
        return true
      }
      return !el.querySelector(widgetSelector)
    })
  }

  function copyText(text, button) {
    navigator.clipboard.writeText(text).then(() => {
      var label = button.textContent
      button.textContent = 'Copied'
      button.classList.add('md-copy-done')
      setTimeout(() => {
        button.textContent = label
        button.classList.remove('md-copy-done')
      }, 1200)
    }).catch((err) => {
      console.error('Copy failed:', err)
    })
  }

  function attachButton(node, text) {
    if (node.querySelector(':scope > button.md-copy')) {
      return
    }
    node.classList.add('md-copy-host')
    var btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'md-copy'
    btn.textContent = 'Copy'
    btn.addEventListener('click', () => {
      var payload = typeof node.__mdGetCopyText === 'function' ? node.__mdGetCopyText() : text
      copyText(payload, btn)
    })
    node.appendChild(btn)
  }

  return {
    attach: () => {
      var sources = blockSources(state.html)
      var sourceQueue = sources.slice()
      var nodes = targets()

      nodes.forEach((node) => {
        if (node.id === '_markdown') {
          attachButton(node, state.markdown)
          return
        }
        var text = sourceQueue.shift()
        if (node.dataset.mdCopySource) {
          text = node.dataset.mdCopySource
        }
        if (text == null) {
          text = node.textContent
        }
        attachButton(node, text)
      })
    }
  }
})()
