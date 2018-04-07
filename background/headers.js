
md.headers = ({storage: {state}, detect}) => {

  var callback = ({method, url, responseHeaders}) => {
    if (method !== 'GET') {
      return {responseHeaders}
    }

    var header = responseHeaders.find(({name}) => /content-type/i.test(name)) || {}
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

  var filter = {
    urls: ['<all_urls>'],
    types: ['main_frame', 'sub_frame']
  }

  var options = ['blocking', 'responseHeaders']

  var add = () => {
    if (!chrome.webRequest.onHeadersReceived.hasListeners()) {
      chrome.webRequest.onHeadersReceived.addListener(callback, filter, options)
    }
  }

  var remove = () => {
    chrome.webRequest.onHeadersReceived.removeListener(callback, filter, options)
  }

  return {add, remove}
}
