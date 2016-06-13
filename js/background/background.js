
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
})

chrome.tabs.onUpdated.addListener((id, info, tab) => {
  if (info.status === 'complete') return
  if (/.*\/.*\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*)?$/
    .test(tab.url)) {
    chrome.pageAction.show(id)
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
    sendMessage({message: 'raw'})
  }

  return true
})

function sendMessage (obj) {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, obj)
  })
}
