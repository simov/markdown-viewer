var wvd = (() => {
  var loaded = false
  var skinPromise = null

  var walk = (regex, string, result = [], match = regex.exec(string)) =>
    !match ? result : walk(regex, string, result.concat(match[1]))

  function decodeHtml(html) {
    var txt = document.createElement('textarea')
    txt.innerHTML = html
    return txt.value
  }

  function syncGlobals() {
    if (typeof window === 'undefined') {
      return
    }
    if (typeof WaveDrom !== 'undefined') {
      window.WaveDrom = WaveDrom
    }
    if (typeof WaveSkin !== 'undefined') {
      window.WaveSkin = WaveSkin
    }
  }

  function waveDrom() {
    if (typeof WaveDrom !== 'undefined') {
      return WaveDrom
    }
    return typeof window !== 'undefined' ? window.WaveDrom : undefined
  }

  function waveSkinReady() {
    var skin = typeof WaveSkin !== 'undefined'
      ? WaveSkin
      : (typeof window !== 'undefined' ? window.WaveSkin : undefined)
    return skin && (skin.default || Object.keys(skin).length)
  }

  function ensureSkin() {
    syncGlobals()
    if (waveSkinReady()) {
      return Promise.resolve()
    }
    if (skinPromise) {
      return skinPromise
    }
    skinPromise = new Promise((resolve, reject) => {
      var script = document.createElement('script')
      script.src = chrome.runtime.getURL('/vendor/wavedrom-skin.min.js')
      script.onload = () => {
        syncGlobals()
        waveSkinReady() ? resolve() : reject(new Error('WaveDrom skin missing'))
      }
      script.onerror = () => reject(new Error('WaveDrom skin failed to load'))
      ;(document.head || document.documentElement).appendChild(script)
    })
    return skinPromise
  }

  function fail(host, message) {
    host.classList.add('wavedrom-error')
    host.textContent = message
  }

  function renderBlocks() {
    var definitions = walk(
      /<pre[^>]*><code class="wavedrom">([\s\S]+?)<\/code><\/pre>/gi,
      state.html
    )

    var blocks = Array.from(document.querySelectorAll(
      'pre code.wavedrom, pre code.language-wavedrom'
    ))

    var wd = waveDrom()
    if (!wd || typeof wd.RenderWaveForm !== 'function') {
      blocks.forEach((block) => {
        var host = document.createElement('div')
        host.className = 'wavedrom-container md-copy-host'
        block.parentElement.replaceWith(host)
        fail(host, 'WaveDrom failed to load')
      })
      loaded = true
      return
    }

    var notFirstSignal = false
    blocks.forEach((block, index) => {
      var pre = block.parentElement
      var host = document.createElement('div')
      host.id = 'WaveDrom_Display_' + index
      host.className = 'wavedrom-container md-copy-host'
      try {
        var raw = decodeHtml((definitions[index] || block.textContent).trim())
        raw = raw.replace(/^\uFEFF/, '').trim()
        host.dataset.mdCopySource = raw
        var spec = JSON.parse(raw)
        pre.replaceWith(host)

        wd.RenderWaveForm(index, spec, 'WaveDrom_Display_', notFirstSignal)
        if (spec && spec.signal && !notFirstSignal) {
          notFirstSignal = true
        }
        if (!host.querySelector('svg, .WaveDrom')) {
          fail(host, 'WaveDrom produced no output')
        }
      }
      catch (err) {
        console.error('Failed to render WaveDrom diagram:', err)
        if (!host.parentElement) {
          pre.replaceWith(host)
        }
        fail(host, 'WaveDrom: ' + err.message)
      }
    })

    loaded = true
  }

  return {
    render: () => {
      loaded = false
      ensureSkin().then(renderBlocks).catch((err) => {
        console.error('Failed to load WaveDrom skin:', err)
        var blocks = Array.from(document.querySelectorAll(
          'pre code.wavedrom, pre code.language-wavedrom'
        ))
        blocks.forEach((block) => {
          var host = document.createElement('div')
          host.className = 'wavedrom-container md-copy-host'
          block.parentElement.replaceWith(host)
          fail(host, err.message)
        })
        loaded = true
      })
    }
  }
})()
