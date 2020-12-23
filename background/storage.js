
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
    theme: 'github',
    compiler: 'marked',
    raw: false,
    header: true,
    match,
    themes: {
      wide: false,
    },
    content: {
      emoji: false,
      scroll: true,
      toc: false,
      mathjax: false,
      autoreload: false,
      mermaid: false,
    },
    origins: {
      'file://': {
        match,
        csp: false,
        encoding: '',
      }
    },
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
  // v3.9 -> v4.0
  if (state.remark.commonmark !== undefined) {
    delete state.remark.commonmark
  }
  if (state.remark.pedantic !== undefined) {
    delete state.remark.pedantic
  }
  if (state.content.mermaid === undefined) {
    state.content.mermaid = false
  }
  if (state.themes === undefined || state.themes instanceof Array) {
    state.themes = {wide: false}
  }
  if (typeof state.theme === 'object') {
    state.theme = state.theme.name
  }
}
