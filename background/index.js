
importScripts('/vendor/markdown-it.min.js')
importScripts('/vendor/marked.min.js')
importScripts('/vendor/remark.min.js')
importScripts('/background/compilers/markdown-it.js')
importScripts('/background/compilers/marked.js')
importScripts('/background/compilers/remark.js')

importScripts('/background/storage.js')
importScripts('/background/webrequest.js')
importScripts('/background/detect.js')
importScripts('/background/inject.js')
importScripts('/background/messages.js')
importScripts('/background/mathjax.js')
importScripts('/background/xhr.js')
importScripts('/background/icon.js')

;(() => {
  console.log('[mdv] SW boot — md.compilers keys =', Object.keys(md.compilers || {}))

  var storage = md.storage(md)
  console.log('[mdv] storage created — state.compiler =', storage.state.compiler,
              'has [markdown-it] options? =', !!storage.state['markdown-it'],
              'origins? =', !!storage.state.origins)

  var inject = md.inject({storage})
  var detect = md.detect({storage, inject})
  var webrequest = md.webrequest({storage})
  var mathjax = md.mathjax()
  var xhr = md.xhr()
  var icon = md.icon({storage})

  var compilers = Object.keys(md.compilers)
    .reduce((all, compiler) => (
      all[compiler] = md.compilers[compiler]({storage}),
      all
    ), {})
  console.log('[mdv] instantiated compilers keys =', Object.keys(compilers),
              '— [markdown-it].description type =', typeof (compilers['markdown-it'] && compilers['markdown-it'].description))

  var messages = md.messages({storage, compilers, mathjax, xhr, webrequest, icon})

  chrome.tabs.onUpdated.addListener(detect.tab)
  chrome.runtime.onMessage.addListener(messages)

  icon()
  console.log('[mdv] SW ready')
})()
