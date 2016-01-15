
riot.tag('options', options.innerHTML, function () {
  function init (res) {
    this.options = res.options
    this.theme = res.theme

    this.themes = chrome.runtime.getManifest().web_accessible_resources
      .filter(function (file) {
        return file.indexOf('/themes/') === 0
      })
      .map(function (file) {
        var name = file.replace(/\/themes\/(.*)\.css/, '$1')
        return name
      })

    this.raw = res.raw
    this.update()
  }

  // init
  chrome.extension.sendMessage({
    message: 'settings'
  }, init.bind(this))

  this.onOptions = function (e) {
    this.options[e.item.key] = !e.item.value
    chrome.extension.sendMessage({
      message: 'options',
      options: this.options
    }, function (res) {

    })
    return true
  }
  this.onTheme = function (e) {
    this.theme = this.themes[e.target.selectedIndex]
    chrome.extension.sendMessage({
      message: 'theme',
      theme: this.theme
    }, function (res) {

    })
  }
  this.onRaw = function () {
    this.raw = !this.raw
    chrome.extension.sendMessage({
      message: 'raw',
      raw: this.raw
    }, function (res) {

    })
  }
  this.onDefaults = function () {
    chrome.extension.sendMessage({
      message: 'defaults'
    }, function (res) {
      chrome.extension.sendMessage({
        message: 'settings'
      }, init.bind(this))
    }.bind(this))
  }
})

riot.mount('options')
