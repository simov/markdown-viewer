
md.messages = ({storage: {defaults, state, set}, compilers, mathjax, xhr, webrequest}) => {

  return (req, sender, sendResponse) => {

    // content
    if (req.message === 'markdown') {
      var markdown = req.markdown

      if (state.content.mathjax) {
        var jax = mathjax()
        markdown = jax.tokenize(markdown)
      }

      var html = compilers[state.compiler].compile(markdown)

      if (state.content.mathjax) {
        html = jax.detokenize(html)
      }

      sendResponse({message: 'html', html})
    }
    else if (req.message === 'autoreload') {
      xhr.get(req.location, (err, body) => {
        sendResponse({err, body})
      })
    }

    // popup
    else if (req.message === 'popup') {
      sendResponse(Object.assign({}, state, {
        options: state[state.compiler],
        description: compilers[state.compiler].description,
        compilers: Object.keys(compilers),
        themes: state.themes,
      }))
    }
    else if (req.message === 'popup.theme') {
      set({theme: req.theme})
      notifyContent({message: 'theme', theme: req.theme})
      sendResponse()
    }
    else if (req.message === 'popup.raw') {
      set({raw: req.raw})
      notifyContent({message: 'raw', raw: req.raw})
      sendResponse()
    }
    else if (req.message === 'popup.defaults') {
      var options = Object.assign({}, defaults)
      options.origins = state.origins
      set(options)
      notifyContent({message: 'reload'})
      sendResponse()
    }
    else if (req.message === 'popup.compiler.name') {
      set({compiler: req.compiler})
      notifyContent({message: 'reload'})
      sendResponse()
    }
    else if (req.message === 'popup.compiler.options') {
      set({[req.compiler]: req.options})
      notifyContent({message: 'reload'})
      sendResponse()
    }
    else if (req.message === 'popup.content') {
      set({content: req.content})
      notifyContent({message: 'reload'})
      webrequest()
      sendResponse()
    }
    else if (req.message === 'popup.advanced') {
      // ff: opens up about:addons with openOptionsPage
      if (/Firefox/.test(navigator.userAgent)) {
        chrome.management.getSelf((extension) => {
          chrome.tabs.create({url: extension.optionsUrl})
        })
      }
      else {
        chrome.runtime.openOptionsPage()
      }
      sendResponse()
    }

    // options
    else if (req.message === 'options.origins') {
      sendResponse({
        origins: state.origins,
        header: state.header,
        match: state.match,
      })
    }
    else if (req.message === 'options.themes') {
      sendResponse({
        themes: state.themes,
      })
    }
    else if (req.message === 'options.header') {
      set({header: req.header})
      sendResponse()
    }

    // origins
    else if (req.message === 'origin.add') {
      state.origins[req.origin] = {
        match: defaults.match,
        csp: false,
        encoding: '',
      }
      set({origins: state.origins})
      sendResponse()
    }
    else if (req.message === 'origin.remove') {
      delete state.origins[req.origin]
      set({origins: state.origins})
      webrequest()
      sendResponse()
    }
    else if (req.message === 'origin.update') {
      state.origins[req.origin] = req.options
      set({origins: state.origins})
      webrequest()
      sendResponse()
    }

    // themes
    else if (req.message === 'themes') {
      set({themes: req.themes})

      ;(() => {
        var defaults = chrome.runtime.getManifest().web_accessible_resources
          .filter((file) => file.indexOf('/themes/') === 0)
          .map((file) => file.replace(/\/themes\/(.*)\.css/, '$1'))
        var custom = state.themes.map(({name}) => name)
        var all = custom.concat(defaults)

        if (!all.includes(state.theme.name)) {
          var theme = {
            name: 'github',
            url: chrome.runtime.getURL('/themes/github.css')
          }
          set({theme})
        }
        else if (custom.includes(state.theme.name)) {
          var theme = state.themes.find(({name}) => state.theme.name === name)
          set({theme})
        }
      })()

      sendResponse()
    }

    return true
  }

  function notifyContent (req, res) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, req, res)
    })
  }
}
