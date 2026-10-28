var scroll = (() => {
  function fenceCount (cls) {
    var re = new RegExp('<code class="(?:language-)?' + cls + '(?:\\s[^"]*)?">', 'gi')
    return (state.html.match(re) || []).length
  }

  function waitFor (resolve, test, maxMs) {
    var elapsed = 0
    var limit = maxMs || 15000
    var timeout = setInterval(() => {
      elapsed += 50
      if (test() || elapsed >= limit) {
        clearInterval(timeout)
        resolve()
      }
    }, 50)
  }

  function waitForCount (enabled, expected, selector, resolve, maxMs) {
    if (!enabled || !expected) {
      resolve()
      return
    }
    waitFor(resolve, () => document.querySelectorAll(selector).length >= expected, maxMs)
  }

  function reveal () {
    window.__mdViewerShown = true
    if ($('#_html')) {
      $('#_html').style.visibility = 'visible'
    }
    if ($('#_markdown')) {
      $('#_markdown').style.visibility = 'visible'
    }
    if ($('#_toc') && !state.raw) {
      $('#_toc').style.visibility = 'visible'
    }
  }

  function onload (done) {
    var failSafe = setTimeout(reveal, 12000)

    Promise.all([
      new Promise((resolve) => {
        waitFor(resolve, () => document.styleSheets.length > 0, 3000)
      }),
      new Promise((resolve) => {
        var images = Array.from(document.querySelectorAll('img'))
        if (!images.length) {
          resolve()
        }
        else {
          Promise.race([
            new Promise((resolve) => {
              var loaded = 0
              images.forEach((img) => {
                img.addEventListener('load', () => {
                  if (++loaded === images.length) {
                    resolve()
                  }
                }, {once: true})
              })
            }),
            new Promise((resolve) => setTimeout(resolve, 500))
          ]).then(resolve)
        }
      }),
      new Promise((resolve) => {
        var code = Array.from(document.querySelectorAll('code[class^=language-]'))
        if (!state.content.syntax || !code.length) {
          resolve()
        }
        else {
          setTimeout(() => resolve(), 40)
        }
      }),
      new Promise((resolve) => {
        var diagrams = Array.from(document.querySelectorAll('code.mermaid'))
        if (!state.content.mermaid || !diagrams.length) {
          resolve()
        }
        else {
          waitFor(resolve, () => {
            var svg = Array.from(document.querySelectorAll('code.mermaid svg'))
            return diagrams.length === svg.length
          }, 15000)
        }
      }),
      new Promise((resolve) => {
        if (!state.content.mathjax) {
          resolve()
        }
        else {
          waitFor(resolve, () => mj.loaded, 15000)
        }
      }),
      new Promise((resolve) => {
        waitForCount(
          state.content.plotly,
          fenceCount('plotly'),
          '.plotly-container',
          resolve
        )
      }),
      new Promise((resolve) => {
        waitForCount(
          state.content.abc,
          fenceCount('abc'),
          '.abc-container',
          resolve
        )
      }),
      new Promise((resolve) => {
        var expected = fenceCount('vegalite')
        if (!state.content.vegalite || !expected) {
          resolve()
        }
        else {
          waitFor(resolve, () => {
            if (!vlt.loaded) {
              return false
            }
            var hosts = Array.from(document.querySelectorAll('.vegalite-container'))
            var rendered = hosts.filter((el) => el.querySelector('svg, canvas')).length
            var errored = hosts.filter((el) => el.classList.contains('vegalite-error')).length
            return hosts.length >= expected && rendered + errored >= expected
          }, 20000)
        }
      }),
      new Promise((resolve) => {
        var expected = fenceCount('graphviz')
        if (!state.content.graphviz || !expected) {
          resolve()
        }
        else {
          waitFor(resolve, () => {
            return gvz.loaded && document.querySelectorAll('.graphviz-container').length >= expected
          }, 15000)
        }
      }),
      new Promise((resolve) => {
        var expected = fenceCount('wavedrom')
        if (!state.content.wavedrom || !expected) {
          resolve()
        }
        else {
          waitFor(resolve, () => {
            var hosts = Array.from(document.querySelectorAll('.wavedrom-container'))
            var rendered = hosts.filter((el) => el.querySelector('svg, .WaveDrom')).length
            var errored = hosts.filter((el) => el.classList.contains('wavedrom-error')).length
            return rendered + errored >= expected
          }, 15000)
        }
      }),
      new Promise((resolve) => {
        var expected = fenceCount('csv') + fenceCount('tsv')
        waitForCount(state.content.csv, expected, '.md-table-wrap', resolve)
      })
    ]).then(() => {
      clearTimeout(failSafe)
      cpy.attach()
      done()
    }).catch(() => {
      clearTimeout(failSafe)
      done()
    })
  }
  function listen (container, done) {
    var listener = /html|body/i.test(container.nodeName) ? window : container
    var timeout = null
    listener.addEventListener('scroll', () => {
      clearTimeout(timeout)
      timeout = setTimeout(done, 100)
    })
  }
  function get (container, prefix, offset) {
    var key = prefix + location.origin + location.pathname
    if (offset) {
      container.scrollTop = offset
      return
    }
    try {
      container.scrollTop = parseInt(localStorage.getItem(key))
    }
    catch (err) {
      chrome.storage.local.get(key, (res) => {
        container.scrollTop = parseInt(res[key])
      })
    }
  }
  function set (container, prefix) {
    var key = prefix + location.origin + location.pathname
    listen(container, () => {
      try {
        localStorage.setItem(key, container.scrollTop)
      }
      catch (err) {
        chrome.storage.local.set({[key]: container.scrollTop})
      }
    })
  }
  var listening = false
  return (update) => {
    if ($('#_toc') && state.raw) $('#_toc').style.visibility = 'hidden'
    onload(() => {
      var container = ((html = $('html')) => (
        html.scrollTop = 1,
        html.scrollTop ? (html.scrollTop = 0, html) : $('body')
      ))()

      if (!update && location.hash && document.getElementById(location.hash.slice(1))) {
        get(container, 'md-', document.getElementById(location.hash.slice(1)).offsetTop)
      }
      else {
        get(container, 'md-')
      }

      if (state.content.toc) {
        setTimeout(() => get($('#_toc'), 'md-toc-'), 10)
      }

      if (!listening) {
        listening = true
        set(container, 'md-')
        if (state.content.toc) {
          setTimeout(() => set($('#_toc'), 'md-toc-'), 10)
        }
      }

      reveal()
    })
  }
})()
