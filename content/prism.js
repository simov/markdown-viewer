
Prism.plugins.autoloader.addScript = (language, done) => {
  chrome.runtime.sendMessage({
    message: 'prism',
    language
  }, done)
}
