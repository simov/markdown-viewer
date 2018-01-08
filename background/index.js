
var storage = md.storage(md)

var headers = md.headers({storage})
var inject = md.inject({storage})
var detect = md.detect({storage, inject})
var mathjax = md.mathjax()

var compilers = Object.keys(md.compilers)
  .reduce((all, compiler) => (
    all[compiler] = md.compilers[compiler]({storage}),
    all
  ), {})

var messages = md.messages({storage, compilers, mathjax, headers})


chrome.tabs.onUpdated.addListener(detect)

chrome.runtime.onMessage.addListener(messages)

chrome.webRequest && headers.add()
