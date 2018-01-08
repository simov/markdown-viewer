
md.detect = ({storage: {state}, inject}) => {

  var onwakeup = true

  var code = `
    JSON.stringify({
      location: window.location,
      contentType: document.contentType,
      loaded: !!window.state,
    })
  `

  var tab = (id) => {
    chrome.tabs.executeScript(id, {code, runAt: 'document_start'}, (res) => {
      if (chrome.runtime.lastError) {
        // origin not allowed
        return
      }

      try {
        var win = JSON.parse(res)
      }
      catch (err) {
        // JSON parse error
        return
      }

      if (win.loaded) {
        // anchor
        return
      }

      if (state.header && /text\/(?:x-)?markdown/i.test(win.contentType)) {
        allowed(id)
      }
      else {
        var path =
          state.origins[win.location.origin] ||
          state.origins['*://' + win.location.host] ||
          state.origins['*://*']

        // ff: webRequest bug - does not match on `hostname:port`
        if (!path && /Firefox/.test(navigator.userAgent)) {
          var path =
            state.origins[win.location.protocol + '//' + win.location.hostname] ||
            state.origins['*://' + win.location.hostname] ||
            state.origins['*://*']
        }

        if (path && new RegExp(path).test(win.location.href)) {
          allowed(id)
        }
      }
    })
  }

  var allowed = (id) => {
    if (onwakeup && state.csp) {
      onwakeup = false
      chrome.tabs.reload(id)
    }
    else {
      inject()
    }
  }

  return (id, info, _tab) => {
    if (info.status === 'loading') {
      tab(id)
    }
  }
}
