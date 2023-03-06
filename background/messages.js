
md.messages = ({storage: {defaults, state, set}, compilers, mathjax, xhr, webrequest, icon}) => {

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
    else if (req.message === 'prism') {
      chrome.scripting.executeScript({
        target: {tabId: sender.tab.id},
        files: [
          `/vendor/prism/prism-${req.language}.min.js`,
        ],
        injectImmediately: true
      }, sendResponse)
    }
    else if (req.message === 'mathjax') {
      chrome.scripting.executeScript({
        target: {tabId: sender.tab.id},
        files: [
          `/vendor/mathjax/extensions/${req.extension}.js`,
        ],
        injectImmediately: true
      }, sendResponse)
    }

    // popup
    else if (req.message === 'popup') {
      sendResponse(Object.assign({}, state, {
        options: state[state.compiler],
        description: compilers[state.compiler].description,
        compilers: Object.keys(compilers),
        themes: state.themes,
        settings: {theme: state.settings.theme}
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
    else if (req.message === 'popup.themes') {
      set({themes: req.themes})
      notifyContent({message: 'themes', themes: req.themes})
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

    // origins view
    else if (req.message === 'options.origins') {
      sendResponse({
        origins: state.origins,
        match: state.match,
      })
    }
    // origins options
    else if (req.message === 'origin.add') {
      state.origins[req.origin] = {
        header: true,
        path: true,
        match: defaults.match,
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

    // settings view
    else if (req.message === 'options.settings') {
      sendResponse(state.settings)
    }
    // settings options
    else if (req.message === 'options.icon') {
      set({settings: req.settings})
      icon()
      sendResponse()
    }
    else if (req.message === 'options.theme') {
      set({settings: req.settings})
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
