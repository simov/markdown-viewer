
md.webrequest = ({storage: {state}, detect}) => {

  var permissions = ['webRequest', 'webRequestBlocking']

  var filter = {
    urls: ['<all_urls>'],
    types: ['main_frame', 'sub_frame']
  }

  var options = ['blocking', 'responseHeaders']

  var onHeadersReceived = ({method, url, statusCode, responseHeaders}) => {
    if (method !== 'GET') {
      return {responseHeaders}
    }

    var header = responseHeaders.find(({name}) => /^content-type/i.test(name))
    var origin = detect.match(url)

    if (/Firefox/.test(navigator.userAgent)) {
      // ff: markdown `content-type` is not allowed
      if (header && detect.header(header.value)) {
        var [_, charset] = header.value.split(';')
        header.value = `text/plain${charset ? `; ${charset}` : ''}`
      }
      // ff: missing `content-type` is not allowed
      else if (!header && origin && statusCode === 200) {
        header = {name: 'Content-Type', value: 'text/plain'}
        responseHeaders.push(header)
      }
    }

    if (!origin) {
      return {responseHeaders}
    }

    if (origin.csp) {
      responseHeaders = responseHeaders
        .filter(({name}) => !/content-security-policy/i.test(name))
    }

    if (origin.encoding && header && (
      /charset/.test(header.value) ||
      // ff: won't decode correctly by default
      /Firefox/.test(navigator.userAgent)
    )) {
      var [media] = header.value.split(';')
      header.value = `${media}; charset=${origin.encoding}`
    }

    return {responseHeaders}
  }

  var onCompleted = ({ip, tabId}) => {
    if (ip && ip !== '127.0.0.1' && ip !== '::1') {
      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, {message: 'autoreload'})
      }, 500)
    }
  }

  var events = () => {
    var headers = false
    for (var key in state.origins) {
      if (state.origins[key].csp || state.origins[key].encoding) {
        headers = true
        break
      }
    }

    // ff: webRequest is required permission
    if (/Firefox/.test(navigator.userAgent)) {
      headers = true
    }

    var completed = false
    if (state.content.autoreload) {
      completed = true
    }

    return {headers, completed}
  }

  var perm = (headers, completed, done) => {
    // ff: webRequest is required permission
    if (/Firefox/.test(navigator.userAgent)) {
      done()
    }
    // request permissions
    else if ((headers || completed) && !chrome.webRequest) {
      chrome.permissions.request({permissions}, done)
    }
    // remove permissions
    else if (!headers && !completed && chrome.webRequest) {
      chrome.permissions.remove({permissions}, () => {
        chrome.webRequest = null
        done()
      })
    }
    else {
      done()
    }
  }

  var webrequest = () => {

    var {headers, completed} = events()

    // remove listeners
    if (chrome.webRequest) {
      if (!headers && !/Firefox/.test(navigator.userAgent)) {
        chrome.webRequest.onHeadersReceived.removeListener(onHeadersReceived)
      }
      if (!completed) {
        chrome.webRequest.onCompleted.removeListener(onCompleted)
      }
    }

    perm(headers, completed, () => {
      // add listeners
      if (headers && !chrome.webRequest.onHeadersReceived.hasListener(onHeadersReceived)) {
        chrome.webRequest.onHeadersReceived.addListener(onHeadersReceived, filter, options)
      }
      if (completed && !chrome.webRequest.onCompleted.hasListener(onCompleted)) {
        chrome.webRequest.onCompleted.addListener(onCompleted, filter)
      }
    })
  }

  webrequest.init = () => {
    chrome.webRequest.onHeadersReceived.addListener(onHeadersReceived, filter, options)
    chrome.webRequest.onCompleted.addListener(onCompleted, filter)
  }

  return webrequest
}
