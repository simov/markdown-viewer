
Prism.plugins.autoloader.addScript = (language, done) => {
  if (location.protocol.endsWith('-extension:')) {
    var script = document.createElement('script')
    script.src = `/vendor/prism/prism-${language}.min.js`
    script.onload = () => done()
    script.onerror = () => done()
    document.body.appendChild(script)
  }
  else {
    chrome.runtime.sendMessage({
      message: 'prism',
      language
    }, done)
  }
}
