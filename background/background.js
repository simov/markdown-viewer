
// chrome.storage.sync.clear()
chrome.storage.sync.get((sync) => {
  if (!sync.options) {
    chrome.storage.sync.set({options: md.defaults})
  }
  if (!sync.theme) {
    chrome.storage.sync.set({theme: 'github'})
  }
  if (sync.raw === undefined) {
    chrome.storage.sync.set({raw: false})
  }
  if (!sync.path) {
    chrome.storage.sync.set({path:
      '.*\\/.*\\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*)?$'
    })
  }
})

chrome.tabs.onUpdated.addListener((id, info, tab) => {
  if (info.status === 'loading') {
    chrome.tabs.executeScript(id, {
      code: 'document.querySelector("pre").style.display = "none";location.href',
      runAt: 'document_start'
    }, (href) => {
      if (chrome.runtime.lastError) {
        return
      }
      chrome.storage.sync.get('path', (res) => {
        if (new RegExp(res.path).test(href)) {
          chrome.tabs.insertCSS(id, {file: 'css/content.css', runAt: 'document_start'})
          chrome.tabs.insertCSS(id, {file: 'css/prism.css', runAt: 'document_start'})
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
    chrome.storage.sync.get(['options', 'theme', 'raw'], (data) => {
      delete data.options.langPrefix
      sendResponse(data)
    })
  }
  else if (req.message === 'options') {
    req.options.langPrefix = 'language-' // prism
    chrome.storage.sync.set({options: req.options}, sendResponse)
    sendMessage({message: 'reload'})
  }
  else if (req.message === 'defaults') {
    chrome.storage.sync.set({options: md.defaults}, sendResponse)
    chrome.storage.sync.set({theme: 'github'})
    chrome.storage.sync.set({raw: false})
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

  return true
})

function sendMessage (obj) {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, obj)
  })
}
