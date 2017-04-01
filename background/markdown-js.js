
md['markdown-js'] = {
  defaults: {

  },
  description: {

  },
  compile: (_markdown, sendResponse) => {
    chrome.storage.sync.get('markdown-js', (res) => {
      var html = markdown.toHTML(_markdown)
      sendResponse({message: 'html', html})
    })
  }
}
