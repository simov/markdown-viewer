
// chrome.storage.sync.clear()
// chrome.permissions.getAll((p) => chrome.permissions.remove({origins: p.origins}))

var match = '\\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\\?.*)?$'

var defaults = {
  theme: 'github',
  compiler: 'marked',
  content: {
    emoji: false,
    scroll: true,
    toc: false,
    mathjax: false,
  },
  raw: false,
  header: true,
  match,
  origins: {
    'file://': match
  }
}
Object.keys(md).forEach((compiler) => {
  defaults[compiler] = md[compiler].defaults
})

var state

function set (options) {
  chrome.storage.sync.set(options)
  Object.assign(state, options)
}

chrome.storage.sync.get((res) => {
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
  // v2.7 -> v2.8
  if (!options.marked) {
    options.compiler = 'marked'
    options.marked = md.marked.defaults
  }
  // v2.8 -> v2.9
  if (!options.remark) {
    options.remark = md.remark.defaults
  }
  // v2.9 -> v3.0
  if (options.content.emoji === undefined) {
    options.content.emoji = false
  }
  // v3.0 -> v3.1
  if (options.header === undefined) {
    options.header = true
  }
  // v3.1 -> v3.2
  if (options.remark && options.remark.yaml) {
    delete options.remark.yaml
  }
  if (options.content.mathjax === undefined) {
    options.content.mathjax = false
  }

  // reload extension bug
  chrome.permissions.getAll((permissions) => {
    var origins = Object.keys(res.origins || {})
    chrome.permissions.remove({
      origins: permissions.origins
        .filter((origin) => origins.indexOf(origin.slice(0, -2)) === -1)
    })
  })

  Object.keys(md).forEach((compiler) => {
    if (!options[compiler]) {
      options[compiler] = md[compiler].defaults
    }
  })

  chrome.storage.sync.set(options)
  state = JSON.parse(JSON.stringify(options))
})

function inject (id) {
  chrome.tabs.executeScript(id, {
    code: `
      document.querySelector('pre').style.visibility = 'hidden'
      var theme = '${state.theme}'
      var raw = ${state.raw}
      var content = ${JSON.stringify(state.content)}
      var compiler = '${state.compiler}'
    `,
    runAt: 'document_start'
  })

  chrome.tabs.insertCSS(id, {file: 'css/content.css', runAt: 'document_start'})
  chrome.tabs.insertCSS(id, {file: 'vendor/prism.css', runAt: 'document_start'})

  chrome.tabs.executeScript(id, {file: 'vendor/mithril.min.js', runAt: 'document_start'})
  chrome.tabs.executeScript(id, {file: 'vendor/prism.js', runAt: 'document_start'})
  if (state.content.emoji) {
    chrome.tabs.executeScript(id, {file: 'content/emoji.js', runAt: 'document_start'})
  }
  chrome.tabs.executeScript(id, {file: 'content/content.js', runAt: 'document_start'})
}

chrome.tabs.onUpdated.addListener((id, info, tab) => {
  if (info.status === 'loading') {
    chrome.tabs.executeScript(id, {
      code: `
        JSON.stringify({
          location: window.location,
          contentType: document.contentType,
          loaded: !!window.state
        })
      `,
      runAt: 'document_start'
    }, (res) => {
      if (chrome.runtime.lastError) {
        // origin not allowed
        return
      }

      try {
        var win = JSON.parse(res)
      }
      catch (err) {
        // JSON parse error
        return
      }

      if (win.loaded) {
        // anchor
        return
      }

      if (state.header && /text\/(?:x-)?markdown/i.test(win.contentType)) {
        inject(id)
      }
      else {
        var path =
          state.origins[win.location.origin] ||
          state.origins['*://' + win.location.host] ||
          state.origins['*://*']

        if (path && new RegExp(path).test(win.location.href)) {
          inject(id)
        }
      }
    })
  }
})

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.message === 'markdown') {
    var markdown = req.markdown

    if (state.content.mathjax) {
      var m = mathjax()
      markdown = m.tokenize(markdown)
    }

    var html = md[state.compiler].compile(markdown)

    if (state.content.mathjax) {
      html = m.detokenize(html)
    }

    sendResponse({message: 'html', html})
  }
  else if (req.message === 'settings') {
    sendResponse(Object.assign({}, state, {
      options: state[state.compiler],
      description: md[state.compiler].description,
      compilers: Object.keys(md)
    }))
  }
  else if (req.message === 'compiler.name') {
    set({compiler: req.compiler})
    sendResponse()
    notifyContent({message: 'reload'})
  }
  else if (req.message === 'compiler.options') {
    set({[req.compiler]: req.options})
    notifyContent({message: 'reload'})
  }
  else if (req.message === 'content') {
    set({content: req.content})
    notifyContent({message: 'reload'})
  }
  else if (req.message === 'defaults') {
    var options = Object.assign({}, defaults)
    options.origins = state.origins
    set(options)
    sendResponse()
    notifyContent({message: 'reload'})
  }
  else if (req.message === 'theme') {
    set({theme: req.theme})
    notifyContent({message: 'theme', theme: req.theme})
  }
  else if (req.message === 'raw') {
    set({raw: req.raw})
    notifyContent({message: 'raw', raw: req.raw})
  }
  else if (req.message === 'advanced') {
    chrome.management.getSelf((extension) => {
      chrome.tabs.create({url: extension.optionsUrl})
    })
  }
  else if (req.message === 'origins') {
    sendResponse({origins: state.origins, header: state.header})
  }
  else if (req.message === 'header') {
    set({header: req.header})
  }
  else if (req.message === 'add') {
    state.origins[req.origin] = match
    set({origins: state.origins})
    sendResponse()
  }
  else if (req.message === 'remove') {
    delete state.origins[req.origin]
    set({origins: state.origins})
    sendResponse()
  }
  else if (req.message === 'update') {
    state.origins[req.origin] = req.match
    set({origins: state.origins})
  }
  return true
})

function notifyContent (req, res) {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, req, res)
  })
}
