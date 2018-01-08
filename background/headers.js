
md.headers = ({storage: {state}}) => {

  var callback = ({responseHeaders}) => ({
    responseHeaders: responseHeaders
      .filter(({name}) => !state.csp || !/content-security-policy/i.test(name))
      // ff: markdown `content-type` is not allowed
      .map((header) => {
        if (
          /Firefox/.test(navigator.userAgent) &&
          header.name.toLowerCase() === 'content-type' &&
          /text\/(?:x-)?markdown/.test(header.value)
        ) {
          header.value = 'text/plain; charset=utf-8'
        }
        return header
      })
    })

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
