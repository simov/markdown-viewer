
md.webrequest = ({storage: {state}, detect}) => {

  var permissions = ['webRequest', 'webRequestBlocking']

  var filter = {
    urls: ['<all_urls>'],
    types: ['main_frame', 'sub_frame']
  }

  var options = ['blocking', 'responseHeaders']

  var onHeadersReceived = ({method, url, responseHeaders}) => {
    if (method !== 'GET') {
      return {responseHeaders}
    }

    var header = responseHeaders.find(({name}) => /^content-type/i.test(name)) || {}
    var origin = detect.match(url)

    if (!detect.header(header.value) && !origin) {
      return {responseHeaders}
    }

    if (origin.csp) {
      responseHeaders = responseHeaders
        .filter(({name}) => !/content-security-policy/i.test(name))
    }

    // ff: markdown `content-type` is not allowed
    if (/Firefox/.test(navigator.userAgent) && detect.header(header.value)) {
      header.value = 'text/plain'
    }

    if (origin.encoding && header.name) {
      var [media] = header.value.split(';')
      header.value = `${media}; charset=${origin.encoding}`
    }

    return {responseHeaders}
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

    return {headers}
  }

  var perm = (headers, done) => {
    // ff: webRequest is required permission
    if (/Firefox/.test(navigator.userAgent)) {
      done()
    }
    // request permissions
    else if (headers && !chrome.webRequest) {
      chrome.permissions.request({permissions}, done)
    }
    // remove permissions
    else if (!headers && chrome.webRequest) {
      chrome.permissions.remove({permissions}, () => {
        chrome.webRequest = null
        done()
      })
    }
    else {
      done()
    }
  }

  return () => {

    var {headers} = events()

    // remove listeners
    if (chrome.webRequest) {
      if (!headers && !/Firefox/.test(navigator.userAgent)) {
        chrome.webRequest.onHeadersReceived.removeListener(onHeadersReceived)
      }
    }

    perm(headers, () => {
      // add listeners
      if (headers && !chrome.webRequest.onHeadersReceived.hasListener(onHeadersReceived)) {
        chrome.webRequest.onHeadersReceived.addListener(onHeadersReceived, filter, options)
      }
    })
  }
}
