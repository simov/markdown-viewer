var vlt = (() => {
  var walk = (regex, string, result = [], match = regex.exec(string)) =>
    !match ? result : walk(regex, string, result.concat(match[1]))

  function decodeHtml(html) {
    var txt = document.createElement('textarea')
    txt.innerHTML = html
    return txt.value
  }

  function rootRef() {
    return typeof globalThis !== 'undefined'
      ? globalThis
      : typeof window !== 'undefined'
        ? window
        : undefined
  }

  function syncGlobals() {
    var root = rootRef()
    if (!root) {
      return
    }
    if (typeof vega !== 'undefined') {
      root.vega = vega
    }
    if (typeof vegaLite !== 'undefined') {
      root.vegaLite = vegaLite
    }
    if (typeof vegaEmbed !== 'undefined') {
      root.vegaEmbed = vegaEmbed
    }
  }

  function vegaNs() {
    if (typeof vega !== 'undefined') {
      return vega
    }
    var root = rootRef()
    return root ? root.vega : undefined
  }

  function liteNs() {
    if (typeof vegaLite !== 'undefined') {
      return vegaLite
    }
    var root = rootRef()
    return root ? root.vegaLite : undefined
  }

  function theme() {
    return (
      state._themes[state.theme] === 'dark' ||
      (state._themes[state.theme] === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) ? 'dark' : undefined
  }

  function embed() {
    if (typeof vegaEmbed !== 'undefined') {
      return vegaEmbed
    }
    var root = rootRef()
    return root ? root.vegaEmbed : undefined
  }

  function embedOptions() {
    var ns = vegaNs()
    var options = {
      actions: false,
      theme: theme(),
      renderer: 'svg',
      ast: true,
      defaultStyle: false,
      mode: 'vega-lite'
    }
    if (ns && ns.expressionInterpreter) {
      options.expr = ns.expressionInterpreter
    }
    return options
  }

  function showError(pre, message) {
    var host = document.createElement('div')
    host.className = 'vegalite-container vegalite-error md-copy-host'
    host.textContent = message
    pre.replaceWith(host)
  }

  function markEmpty(host) {
    if (!host.querySelector('svg, canvas')) {
      host.classList.add('vegalite-error')
      host.textContent = 'Vega-Lite produced no output'
    }
  }

  function fenceSourceRegex() {
    return /<pre[^>]*><code class="(?:[^"]*\s)?(?:vegalite|language-vega-lite|language-vegalite|language-vega)(?:\s[^"]*)?">([\s\S]+?)<\/code><\/pre>/gi
  }

  function blockSelector() {
    return [
      'pre code.vegalite',
      'pre code.language-vega-lite',
      'pre code.language-vegalite',
      'pre code.language-vega'
    ].join(', ')
  }

  function finishPending(pending, done) {
    pending.count -= 1
    if (pending.count <= 0) {
      vlt.loaded = true
      if (typeof done === 'function') {
        done()
      }
    }
  }

  return {
    loaded: false,
    render: (done) => {
      vlt.loaded = false
      syncGlobals()

      var definitions = walk(fenceSourceRegex(), state.html)

      var blocks = Array.from(document.querySelectorAll(blockSelector()))

      if (!blocks.length) {
        vlt.loaded = true
        if (typeof done === 'function') {
          done()
        }
        return
      }

      var vegaEmbedFn = embed()
      var lite = liteNs()
      var options = embedOptions()

      if (typeof vegaEmbedFn !== 'function') {
        blocks.forEach((block) => {
          showError(block.parentElement, 'Vega-Lite failed to load (vegaEmbed missing)')
        })
        vlt.loaded = true
        if (typeof done === 'function') {
          done()
        }
        return
      }

      if (!lite || typeof lite.compile !== 'function') {
        blocks.forEach((block) => {
          showError(block.parentElement, 'Vega-Lite failed to load (vega-lite missing)')
        })
        vlt.loaded = true
        if (typeof done === 'function') {
          done()
        }
        return
      }

      if (!options.expr) {
        blocks.forEach((block) => {
          showError(block.parentElement, 'Vega-Lite failed to load (CSP interpreter missing)')
        })
        vlt.loaded = true
        if (typeof done === 'function') {
          done()
        }
        return
      }

      var pending = {count: blocks.length}

      blocks.forEach((block, index) => {
        var pre = block.parentElement
        try {
          var raw = decodeHtml((definitions[index] || block.textContent).trim())
          raw = raw.replace(/^\uFEFF/, '').trim()
          var spec = JSON.parse(raw)

          var host = document.createElement('div')
          host.className = 'vegalite-container md-copy-host'
          host.dataset.mdCopySource = raw
          pre.replaceWith(host)

          Promise.race([
            Promise.resolve(vegaEmbedFn(host, spec, embedOptions())),
            new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Timed out after 20s')), 20000)
            })
          ])
            .then(() => markEmpty(host))
            .catch((err) => {
              console.error('Failed to render Vega-Lite chart:', err)
              host.classList.add('vegalite-error')
              host.textContent = 'Vega-Lite: ' + (err && err.message ? err.message : String(err))
            })
            .finally(() => finishPending(pending, done))
        }
        catch (err) {
          console.error('Failed to render Vega-Lite chart:', err)
          showError(pre, 'Vega-Lite: ' + err.message)
          finishPending(pending, done)
        }
      })
    }
  }
})()
