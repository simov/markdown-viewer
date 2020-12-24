
md.inject = ({storage: {state}}) => (id) => {

  chrome.tabs.executeScript(id, {
    code: `
      document.querySelector('pre').style.visibility = 'hidden'
      var theme = ${JSON.stringify(state.theme)}
      var raw = ${state.raw}
      var themes = ${JSON.stringify(state.themes)}
      var content = ${JSON.stringify(state.content)}
      var compiler = '${state.compiler}'
    `,
    runAt: 'document_start'
  })

  chrome.tabs.insertCSS(id, {file: 'content/index.css', runAt: 'document_start'})
  chrome.tabs.insertCSS(id, {file: 'vendor/prism.min.css', runAt: 'document_start'})

  chrome.tabs.executeScript(id, {file: 'vendor/mithril.min.js', runAt: 'document_start'})
  chrome.tabs.executeScript(id, {file: 'vendor/prism.min.js', runAt: 'document_start'})
  if (state.content.emoji) {
    chrome.tabs.executeScript(id, {file: 'content/emoji.js', runAt: 'document_start'})
  }
  chrome.tabs.executeScript(id, {file: 'content/index.js', runAt: 'document_start'})
}
