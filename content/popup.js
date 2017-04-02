
function load (path) {
  var script = document.createElement('script')
  script.type = 'text/javascript'
  script.charset = 'utf-8'
  script.src = path
  document.body.appendChild(script)
}

chrome.runtime.sendMessage({message: 'ping'}, (res) => {
  if (res && res.message === 'pong') {
    load('/content/popup-options.js')
  }
  else {
    load('/content/popup-help.js')
  }
})
