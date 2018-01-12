
var storage = md.storage(md)

var inject = md.inject({storage})
var detect = md.detect({storage, inject})
var headers = md.headers({storage, detect})
var mathjax = md.mathjax()

var compilers = Object.keys(md.compilers)
  .reduce((all, compiler) => (
    all[compiler] = md.compilers[compiler]({storage}),
    all
  ), {})

var messages = md.messages({storage, compilers, mathjax, headers})


chrome.tabs.onUpdated.addListener(detect.tab)

chrome.runtime.onMessage.addListener(messages)

chrome.webRequest && headers.add()
