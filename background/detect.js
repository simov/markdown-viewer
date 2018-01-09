
md.detect = ({storage: {state}, inject}) => {

  var onwakeup = true

  var code = `
    JSON.stringify({
      url: window.location.href,
      header: document.contentType,
      loaded: !!window.state,
    })
  `

  var tab = (id, info, tab) => {
    if (info.status === 'loading') {
      // try
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

        if (match(win.header, win.url)) {
          if (onwakeup && state.csp) {
            onwakeup = false
            chrome.tabs.reload(id)
          }
          else {
            inject()
          }
        }
      })
    }
  }

  var match = (header, url) => {
    if (state.header && header && /text\/(?:x-)?markdown/i.test(header)) {
      return true
    }
    else {
      var location = new URL(url)

      var path =
        state.origins[location.origin] ||
        state.origins['*://' + location.host] ||
        state.origins['*://*']

      // ff: webRequest bug - does not match on `hostname:port`
      if (!path && /Firefox/.test(navigator.userAgent)) {
        var path =
          state.origins[location.protocol + '//' + location.hostname] ||
          state.origins['*://' + location.hostname] ||
          state.origins['*://*']
      }

      if (path && new RegExp(path).test(location.href)) {
        return true
      }
    }
  }

  return {tab, match}
}
