
md.headers = ({storage: {state}, detect}) => {

  var callback = ({method, url, responseHeaders}) => {
    if (method !== 'GET') {
      return {responseHeaders}
    }

    var header = responseHeaders.find(({name}) => /content-type/i.test(name))

    if (!detect.match(header, url)) {
      return {responseHeaders}
    }

    if (state.csp) {
      responseHeaders = responseHeaders
        .filter(({name}) => !/content-security-policy/i.test(name))
    }

    if (/Firefox/.test(navigator.userAgent)) {
      responseHeaders = responseHeaders
        // ff: markdown `content-type` is not allowed
        .map((header) => {
          if (
            /content-type/i.test(header.name) &&
            /text\/(?:x-)?markdown/.test(header.value)
          ) {
            header.value = 'text/plain; charset=utf-8'
          }
          return header
        })
    }

    return {responseHeaders}
  }

  var filter = {
    urls: ['<all_urls>'],
    types: ['main_frame', 'sub_frame']
  }

  var options = ['blocking', 'responseHeaders']

  var add = () => {
    chrome.webRequest.onHeadersReceived.addListener(callback, filter, options)
  }

  var remove = () => {
    chrome.webRequest.onHeadersReceived.removeListener(callback, filter, options)
  }

  return {add, remove}
}
