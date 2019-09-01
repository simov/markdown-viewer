
// chrome.storage.sync.clear()
// chrome.permissions.getAll((p) => chrome.permissions.remove({origins: p.origins}))

md.storage = ({compilers}) => {

  var defaults = md.storage.defaults(compilers)

  var state = {}

  function set (options) {
    chrome.storage.sync.set(options)
    Object.assign(state, options)
  }

  chrome.storage.sync.get((res) => {
    md.storage.bug(res)

    Object.assign(state, JSON.parse(JSON.stringify(
      !Object.keys(res).length ? defaults : res)))

    // mutate
    md.storage.migrations(state)

    // in case of new providers from the compilers branch
    Object.keys(compilers).forEach((compiler) => {
      if (!state[compiler]) {
        state[compiler] = compilers[compiler].defaults
      }
    })

    set(state)
  })

  return {defaults, state, set}
}

md.storage.defaults = (compilers) => {
  var match = '\\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\\?.*)?$'

  var defaults = {
    theme: {
      name: 'github',
      url: chrome.runtime.getURL('/themes/github.css')
    },
    compiler: 'marked',
    raw: false,
    header: true,
    match,
    content: {
      emoji: false,
      scroll: true,
      toc: false,
      mathjax: false,
      autoreload: false,
    },
    origins: {
      'file://': {
        match,
        csp: false,
        encoding: '',
      }
    },
    themes: [],
  }

  Object.keys(compilers).forEach((compiler) => {
    defaults[compiler] = compilers[compiler].defaults
  })

  return defaults
}

md.storage.bug = (res) => {
  // reload extension bug
  chrome.permissions.getAll((permissions) => {
    var origins = Object.keys(res.origins || {})
    chrome.permissions.remove({
      origins: permissions.origins
        .filter((origin) => origins.indexOf(origin.slice(0, -2)) === -1)
    })
  })
}

md.storage.migrations = (state) => {
  // v3.6 -> v3.7
  if (typeof state.origins['file://'] === 'object') {
    state.origins['file://'].csp = false
  }
  if (typeof state.theme === 'string') {
    state.theme = {
      name: state.theme,
      url: chrome.runtime.getURL(`/themes/${state.theme}.css`)
    }
  }
  if (state.themes === undefined) {
    state.themes = []
  }
  if (state.marked.tables !== undefined) {
    delete state.marked.tables
  }
}
