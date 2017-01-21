
// chrome.storage.sync.clear()
// chrome.permissions.getAll((p) => chrome.permissions.remove({origins: p.origins}))

chrome.storage.sync.get((res) => {
  var match = '.*\\/.*\\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*)?$'

  var defaults = {
    compiler: md.defaults,
    content: {
      toc: false,
      scroll: true
    },
    theme: 'github',
    raw: false,
    match,
    origins: {
      'file://': match
    }
  }

  var options = !Object.keys(res).length ? defaults : res

  // v2.2 -> v2.3
  if (!options.match || !options.origins) {
    options.match = match
    options.origins = {
      'file://': match
    }
  }
  // v2.3 -> v2.4
  else if (!options.origins['file://']) {
    options.origins['file://'] = match
  }
  // v2.4 -> v2.5
  if (!options.compiler) {
    options.compiler = options.options
  }
  if (!options.content) {
    options.content = defaults.content
  }

  chrome.storage.sync.set(options)

  // reload extension bug
  chrome.permissions.getAll((permissions) => {
    var origins = Object.keys(res.origins || {})
    chrome.permissions.remove({
      origins: permissions.origins
        .filter((origin) => (origins.indexOf(origin.slice(0, -2)) === -1))
    })
  })
})

function parallel (tasks, done) {
  var complete = 0, error, result = {}
  tasks.forEach((task) => task((err, res) => {
    if (error) {
      return
    }
    if (err) {
      error = err
      done(err)
      return
    }
    if (res) {
      Object.keys(res).forEach((key) => {
        result[key] = res[key]
      })
    }
    if (++complete === tasks.length) {
      done(null, result)
    }
  }))
}

chrome.tabs.onUpdated.addListener((id, info, tab) => {
  if (info.status === 'loading') {
    parallel([
      (done) => {
        chrome.tabs.executeScript(id, {
          code: 'JSON.stringify({location, state: window.state})',
          runAt: 'document_start'
        }, (res) => {
          if (chrome.runtime.lastError) {
            done(new Error('Origin not allowed'))
            return
          }
          try {
            res = JSON.parse(res)
          }
          catch (err) {
            done(new Error('JSON parse error'))
            return
          }
          done(null, res)
        })
      },
      (done) => {
        chrome.storage.sync.get((res) => done(null, res))
      }
    ], (err, res) => {
      if (err) {
        return
      }
      if (!res.origins[res.location.origin]) { // v2.2 -> v2.3
        return
      }
      if (!res.state && new RegExp(res.origins[res.location.origin]).test(res.location.href)) {
        chrome.tabs.executeScript(id, {
          code: [
            'document.querySelector("pre").style.visibility = "hidden"',
            'var theme = "' + res.theme + '"',
            'var raw = ' + res.raw,
            'var content = ' + JSON.stringify(res.content)
          ].join(';'), runAt: 'document_start'})

        chrome.tabs.insertCSS(id, {file: 'css/content.css', runAt: 'document_start'})
        chrome.tabs.insertCSS(id, {file: 'vendor/prism.css', runAt: 'document_start'})

        chrome.tabs.executeScript(id, {file: 'vendor/mithril.min.js', runAt: 'document_start'})
        chrome.tabs.executeScript(id, {file: 'vendor/prism.js', runAt: 'document_start'})
        chrome.tabs.executeScript(id, {file: 'content/content.js', runAt: 'document_start'})

        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          chrome.pageAction.show(tabs[0].id)
        })
      }
    })
  }
})

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.message === 'markdown') {
    md.compile(req.markdown, sendResponse)
  }
  else if (req.message === 'settings') {
    chrome.storage.sync.get(['compiler', 'content', 'theme', 'raw'], (res) => {
      delete res.compiler.langPrefix
      sendResponse(res)
    })
  }
  else if (req.message === 'compiler') {
    req.compiler.langPrefix = 'language-' // prism
    chrome.storage.sync.set({compiler: req.compiler}, sendResponse)
    sendMessage({message: 'reload'})
  }
  else if (req.message === 'content') {
    chrome.storage.sync.set({content: req.content}, sendResponse)
    sendMessage({message: 'reload'})
  }
  else if (req.message === 'defaults') {
    chrome.storage.sync.set(
      {compiler: md.defaults, content: {toc: false, scroll: true}, theme: 'github', raw: false}, sendResponse)
    sendMessage({message: 'reload'})
  }
  else if (req.message === 'theme') {
    chrome.storage.sync.set({theme: req.theme}, sendResponse)
    sendMessage({message: 'theme', theme: req.theme})
  }
  else if (req.message === 'raw') {
    chrome.storage.sync.set({raw: req.raw}, sendResponse)
    sendMessage({message: 'raw', raw: req.raw})
  }
  else if (req.message === 'advanced') {
    chrome.management.getSelf((extension) => {
      chrome.tabs.create({url: extension.optionsUrl}, sendResponse)
    })
  }
  else if (req.message === 'origins') {
    chrome.storage.sync.get('origins', sendResponse)
  }
  else if (req.message === 'add') {
    chrome.storage.sync.get(['match', 'origins'], (res) => {
      res.origins[req.origin] = res.match
      chrome.storage.sync.set({origins: res.origins}, sendResponse)
    })
  }
  else if (req.message === 'remove') {
    chrome.storage.sync.get('origins', (res) => {
      delete res.origins[req.origin]
      chrome.storage.sync.set({origins: res.origins}, sendResponse)
    })
  }
  else if (req.message === 'update') {
    chrome.storage.sync.get('origins', (res) => {
      res.origins[req.origin] = req.match
      chrome.storage.sync.set({origins: res.origins}, sendResponse)
    })
  }
  return true
})

function sendMessage (req) {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, req)
  })
}
