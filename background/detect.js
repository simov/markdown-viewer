
md.detect = ({storage: {state}, inject}) => {

  var onwakeup = true

  var code = `
    JSON.stringify({
      url: window.location.href,
      header: document.contentType,
      loaded: !!window.state,
    })
  `

  var checkIsRichPage = `((function() {
    var threshold = 5;
    /* ^ Number of Element nodes required on the page for
         it to be considered rich (i.e. not just markdown) */

    var elements = [document.body];
    var seen = 0;

    loop:
    while (seen < elements.length) {
      var element = elements[seen];
      for (let childI = 0; childI < element.childNodes.length; childI++) {
        let child = element.childNodes[childI];
        if (!(child instanceof Element)) continue;
        elements.push(child);
      }
      seen++;
      if (seen >= threshold) break loop;
    }

    return seen >= threshold;
  })())`

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

        if (header(win.header) || match(win.url)) {
          if (onwakeup && chrome.webRequest) {
            onwakeup = false
            chrome.tabs.reload(id)
          }
          else {
            chrome.tabs.executeScript(id, {code: checkIsRichPage, runAt: 'document_end'}, (pageIsRichJson) => {
              if (chrome.runtime.lastError) {
                return
              }

              var pageIsRich = JSON.parse(pageIsRichJson)

              if (!pageIsRich) {
                inject(id)
              }
            })
          }
        }
      })
    }
  }

  var header = (value) => {
    return state.header && value && /text\/(?:x-)?markdown/i.test(value)
  }

  var match = (url) => {
    var location = new URL(url)

    var origin =
      state.origins[location.origin] ||
      state.origins[location.protocol + '//' + location.hostname] ||
      state.origins['*://' + location.host] ||
      state.origins['*://' + location.hostname] ||
      state.origins['*://*']

    if (origin && origin.match && new RegExp(origin.match).test(location.href)) {
      return origin
    }
  }

  return {tab, header, match}
}
