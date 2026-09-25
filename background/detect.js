
md.detect = ({storage: {state}, inject}) => {

  var onwakeup = true

  var ff = (id, info, done) => {
    if (chrome.runtime.getBrowserInfo === undefined) {
      // chrome
      done('load')
    }
    else {
      var manifest = chrome.runtime.getManifest()
      if (manifest.browser_specific_settings && manifest.browser_specific_settings.gecko) {
        if (!info.url) {
          done('noop')
        }
        else {
          chrome.tabs.sendMessage(id, {message: 'ping'})
            .then(() => done('noop'))
            .catch(() => done('load'))
        }
      }
      else {
        done('load')
      }
    }
  }

  var tab = (id, info, tab) => {

    if (info.status === 'loading') {
      ff(id, info, (action) => {
        if (action === 'noop') {
          return
        }
        // try
        chrome.scripting.executeScript({
          target: {tabId: id},
          func: () =>
            JSON.stringify({
              url: window.location.href,
              header: document.contentType,
              loaded: !!window.state,
            })
        }, (res) => {
          if (chrome.runtime.lastError) {
            // origin not allowed
            return
          }

          try {
            var win = JSON.parse(res[0].result)
            if (!win) {
              return
            }
          }
          catch (err) {
            // JSON parse error
            return
          }

          if (win.loaded) {
            // anchor
            return
          }

          // On a cold MV3 service-worker wake, the tabs.onUpdated event that
          // woke the worker can reach here before storage.sync.get() has
          // populated state (the worker's whole JS env was destroyed on the
          // prior idle-termination and is re-running top-level init async).
          // detect() dereferences state.origins, which is undefined until
          // that callback lands, so it would throw and the waking tab would
          // never inject — the "didn't render, reload fixes it" symptom.
          // storage.js mutates the same state object in place, so poll briefly
          // for readiness, then detect. 100 * 10ms = ~1s cap; storage
          // normally resolves in a few ms.
          var attempts = 0
          var whenReady = () => {
            if (!state.origins) {
              if (++attempts > 100) return // give up; next tab event retries
              return setTimeout(whenReady, 10)
            }
            if (detect(win.header, win.url)) {
              // The onwakeup reload exists only so the worker's re-attached
              // webRequest.onCompleted listener observes the page load (it
              // suppresses interval-autoreload on non-localhost origins). For
              // file:// and localhost that listener is a no-op (onCompleted
              // ignores empty/loopback ip), and file autoreload runs from
              // autoreload.js's own interval regardless — so the reload buys
              // nothing there and just costs a full extra load on the first
              // render after every ~30s worker idle-termination. Inject
              // directly for those; only reload for real remote origins.
              var isLocal =
                /^file:/.test(win.url) ||
                /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?:[:/]|$)/.test(win.url)
              if (onwakeup && chrome.webRequest && !isLocal) {
                onwakeup = false
                chrome.tabs.reload(id)
              }
              else {
                inject(id)
              }
            }
          }
          whenReady()
        })
      })
    }
  }

  var detect = (content, url) => {
    var location = new URL(url)

    var origin =
      state.origins[location.origin] ||

      state.origins[location.protocol + '//' + location.hostname] ||
      state.origins[location.protocol + '//' + location.host] ||
      state.origins[location.protocol + '//*.' + location.hostname.replace(/^[^.]+\.(.*)/, '$1')] ||
      state.origins[location.protocol + '//*.' + location.host.replace(/^[^.]+\.(.*)/, '$1')] ||

      state.origins['*://' + location.hostname] ||
      state.origins['*://' + location.host] ||
      state.origins['*://*.' + location.hostname.replace(/^[^.]+\.(.*)/, '$1')] ||
      state.origins['*://*.' + location.host.replace(/^[^.]+\.(.*)/, '$1')] ||

      state.origins['*://*']

    return (
      (origin && origin.header && origin.path && origin.match && /\btext\/(?:(?:(?:x-)?markdown)|plain)\b/i.test(content) && new RegExp(origin.match).test(location.href)) ||
      (origin && origin.header && !origin.path && /\btext\/(?:(?:(?:x-)?markdown)|plain)\b/i.test(content)) ||
      (origin && origin.path && origin.match && !origin.header && new RegExp(origin.match).test(location.href))
        ? origin
        : undefined
    )
  }

  return {tab}
}
