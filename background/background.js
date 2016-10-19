
// chrome.storage.sync.clear()
// chrome.permissions.getAll((p) => chrome.permissions.remove({origins: p.origins}))

chrome.storage.sync.get((sync) => {
  if (!Object.keys(sync).length) {
    chrome.storage.sync.set({
      options: md.defaults,
      theme: 'github',
      raw: false,
      match: '.*\\/.*\\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*)?$',
      origins: {}
    })
  }
})

chrome.tabs.onUpdated.addListener((id, info, tab) => {
  if (info.status === 'loading') {
    chrome.tabs.executeScript(id, {
      code: 'document.querySelector("pre").style.display = "none";JSON.stringify(location)',
      runAt: 'document_start'
    }, (location) => {
      if (chrome.runtime.lastError) {
        return
      }
      location = JSON.parse(location)
      chrome.storage.sync.get('origins', (res) => {
        if (new RegExp(res.origins[location.origin]).test(location.href)) {
          chrome.tabs.insertCSS(id, {file: 'css/content.css', runAt: 'document_start'})
          chrome.tabs.insertCSS(id, {file: 'vendor/prism.css', runAt: 'document_start'})
          chrome.tabs.executeScript(id, {file: 'vendor/mithril.min.js', runAt: 'document_start'})
          chrome.tabs.executeScript(id, {file: 'vendor/prism.js', runAt: 'document_start'})
          chrome.tabs.executeScript(id, {file: 'content/content.js', runAt: 'document_start'})
        }
        else {
          chrome.tabs.executeScript(id, {
            code: 'document.querySelector("pre").style.display = "block"',
            runAt: 'document_start'
          })
        }
      })
    })
  }
})

chrome.extension.onMessage.addListener((req, sender, sendResponse) => {
  if (req.message === 'markdown') {
    md.compile(req.markdown, sendResponse)
  }
  else if (req.message === 'settings') {
    chrome.storage.sync.get(['options', 'theme', 'raw'], (res) => {
      delete res.options.langPrefix
      sendResponse(res)
    })
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.pageAction.show(tabs[0].id)
    })
  }
  else if (req.message === 'options') {
    req.options.langPrefix = 'language-' // prism
    chrome.storage.sync.set({options: req.options}, sendResponse)
    sendMessage({message: 'reload'})
  }
  else if (req.message === 'defaults') {
    chrome.storage.sync.set(
      {options: md.defaults, theme: 'github', raw: false}, sendResponse)
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
