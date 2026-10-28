var gvz = (() => {
  var graphviz = null

  var walk = (regex, string, result = [], match = regex.exec(string)) =>
    !match ? result : walk(regex, string, result.concat(match[1]))

  function decodeHtml(html) {
    var txt = document.createElement('textarea')
    txt.innerHTML = html
    return txt.value
  }

  function wasmModule() {
    var root = typeof globalThis !== 'undefined'
      ? globalThis
      : typeof window !== 'undefined'
        ? window
        : undefined
    if (root && root['@hpcc-js/wasm']) {
      return root['@hpcc-js/wasm']
    }
    if (typeof module !== 'undefined' && module.exports && module.exports.Graphviz) {
      return module.exports
    }
    return undefined
  }

  function ensureGraphviz() {
    if (graphviz) {
      return Promise.resolve(graphviz)
    }
    var mod = wasmModule()
    if (!mod || !mod.Graphviz) {
      return Promise.reject(new Error('Graphviz wasm bundle missing'))
    }
    return Promise.race([
      mod.Graphviz.load(),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Graphviz load timed out')), 15000)
      })
    ]).then((instance) => {
      graphviz = instance
      return graphviz
    })
  }

  function replaceBlock(pre, host) {
    host.classList.add('graphviz-container', 'md-copy-host')
    pre.replaceWith(host)
    return host
  }

  function showError(pre, message) {
    var host = document.createElement('div')
    host.className = 'graphviz-container graphviz-error md-copy-host'
    host.textContent = message
    replaceBlock(pre, host)
  }

  return {
    loaded: false,
    render: () => {
      gvz.loaded = false
      var definitions = walk(
        /<pre[^>]*><code class="graphviz">([\s\S]+?)<\/code><\/pre>/gi,
        state.html
      )
      var blocks = Array.from(document.querySelectorAll(
        'pre code.graphviz, pre code.language-dot, pre code.language-graphviz'
      ))

      if (!blocks.length) {
        gvz.loaded = true
        return
      }

      ensureGraphviz().then((gv) => {
        blocks.forEach((block, index) => {
          var pre = block.parentElement
          try {
            var dot = decodeHtml((definitions[index] || block.textContent).trim())
            dot = dot.replace(/^\uFEFF/, '').trim()
            var svg = gv.layout(dot, 'svg', 'dot')
            var host = document.createElement('div')
            host.dataset.mdCopySource = dot
            host.innerHTML = svg
            replaceBlock(pre, host)
          }
          catch (err) {
            console.error('Failed to render Graphviz diagram:', err)
            showError(pre, 'Graphviz: ' + err.message)
          }
        })
        gvz.loaded = true
      }).catch((err) => {
        console.error('Failed to load Graphviz:', err)
        blocks.forEach((block) => {
          showError(block.parentElement, 'Graphviz: ' + err.message)
        })
        gvz.loaded = true
      })
    }
  }
})()
