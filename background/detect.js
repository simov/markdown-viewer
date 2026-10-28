
md.detect = ({storage, inject}) => {

  var state = storage.state
  var onwakeup = true
  // tab id -> url we already rendered or decided is not markdown
  var injected = new Map()
  // tab id currently running the content-type probe
  var inflight = new Set()
  // a newer navigation event that arrived while a probe was running
  var queued = new Map()

  var ff = (id, info, status, done) => {
    // status=loading still belongs to the document being replaced. Its
    // content script answers the ping, which used to mark the reload as
    // already rendered and leave the new document as raw markdown.
    if (status !== 'complete' || !info.url) {
      done('load')
    }
    else {
      var pending = chrome.tabs.sendMessage(id, {message: 'ping'})
      if (pending && typeof pending.then === 'function') {
        pending.then((res) => {
          if (res && res.ready) {
            done('noop')
          }
          else {
            done('load')
          }
        }).catch(() => done('load'))
      }
      else {
        done('load')
      }
    }
  }

  var markFileAccess = (allowed) => {
    md.needsFileAccess = !allowed
    if (!chrome.action || !chrome.action.setBadgeText) {
      return
    }
    chrome.action.setBadgeText({text: allowed ? '' : '!'})
    if (!allowed && chrome.action.setBadgeBackgroundColor) {
      chrome.action.setBadgeBackgroundColor({color: '#b71c1c'})
    }
  }

  var settle = (id) => {
    inflight.delete(id)
    var again = queued.get(id)
    if (again) {
      queued.delete(id)
      tab(id, again.info, again.tab)
    }
  }

  var probe = (id, url, status) => {
    var settled = false
    var finish = (res) => {
      if (settled) {
        return
      }
      settled = true

      if (chrome.runtime.lastError || !res || !res[0] || res[0].result == null) {
        // Firefox reports a missing host permission both when a file:// document
        // is still navigating and when file access has not been granted.
        if (/^file:/i.test(url)) {
          markFileAccess(false)
        }
        settle(id)
        return
      }

      try {
        var win = JSON.parse(res[0].result)
        if (!win) {
          settle(id)
          return
        }
      }
      catch (err) {
        // JSON parse error
        settle(id)
        return
      }

      if (/^file:/i.test(win.url || url)) {
        markFileAccess(true)
      }

      if (win.loaded) {
        // The outgoing document still has the viewer during a reload.
        // Only a completed document can count as already rendered.
        if (status === 'complete') {
          injected.set(id, win.url || url)
        }
        settle(id)
        return
      }

      if (detect(win.header, win.url)) {
        if (onwakeup && chrome.webRequest) {
          onwakeup = false
          chrome.tabs.reload(id)
        }
        else {
          injected.set(id, win.url || url)
          inject(id)
        }
      }
      else {
        injected.set(id, win.url || url)
      }
      settle(id)
    }

    var task
    try {
      task = chrome.scripting.executeScript({
        target: {tabId: id},
        injectImmediately: true,
        func: () =>
          JSON.stringify({
            url: window.location.href,
            header: document.contentType,
            loaded: !!window.__mdViewerShown,
          })
      }, finish)
    }
    catch (err) {
      finish(null)
      return
    }

    // Firefox rejects the promise in addition to invoking the callback.
    if (task && typeof task.then === 'function') {
      task.then(finish).catch(() => finish(null))
    }
  }

  var tab = (id, info, tab) => {
    if (!info || (info.status !== 'loading' && info.status !== 'complete')) {
      return
    }

    // Firefox often emits status without changeInfo.url. The tab object
    // still carries the url for origins we have permission to see.
    // Same-url reloads must render again. Drop the previous document as
    // soon as navigation starts, even when that event has no url yet.
    if (info.status === 'loading') {
      injected.delete(id)
    }

    var url = info.url || (tab && tab.url)
    if (!url) {
      return
    }
    if (inflight.has(id)) {
      queued.set(id, {info: info, tab: tab})
      return
    }
    inflight.add(id)

    var details = info.url ? info : Object.assign({}, info, {url: url})

    var run = () => ff(id, details, info.status, (action) => {
      if (action === 'noop') {
        injected.set(id, url)
        settle(id)
        return
      }
      probe(id, url, info.status)
    })

    if (storage.ready && typeof storage.ready.then === 'function') {
      storage.ready.then(run)
    }
    else {
      run()
    }
  }

  var detect = (content, url) => {
    content = content || ''
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

    var header = /\btext\/(?:(?:(?:x-)?markdown)|plain)\b/i.test(content)
    // Firefox sniffs markdown that starts with HTML as text/html and would
    // otherwise skip the file even though the path matches.
    var htmlSniffed = /\btext\/html\b/i.test(content)
    var path = origin && origin.match && new RegExp(origin.match).test(location.href)

    return (
      (origin && origin.header && origin.path && (header || htmlSniffed) && path) ||
      (origin && origin.header && !origin.path && header) ||
      (origin && origin.path && !origin.header && path)
        ? origin
        : undefined
    )
  }

  return {tab}
}
