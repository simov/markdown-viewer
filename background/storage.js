
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
    match,
    themes: {
      width: 'auto',
    },
    content: {
      autoreload: false,
      emoji: false,
      mathjax: false,
      mermaid: false,
      syntax: true,
      toc: false,
    },
    origins: {
      'file://': {
        header: true,
        path: true,
        match,
      }
    },
    settings: {
      icon: 'dark',
      theme: 'light',
    }
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
  // v4.0 -> v5.0
  Object.keys(state.origins).forEach((origin) => {
    state.origins[origin].csp = false
    state.origins[origin].encoding = ''
  })
  if (state.marked.smartLists !== undefined) {
    delete state.marked.smartLists
  }
  if (state.content.syntax === undefined) {
    state.content.syntax = true
  }
  if (state.themes.wide !== undefined) {
    if (state.themes.wide) {
      state.themes.width = 'full'
    }
    delete state.themes.wide
  }
  if (state.icon === undefined) {
    state.icon = false
  }
  if (state.remark.footnotes !== undefined) {
    delete state.remark.footnotes
  }
  // v5.0 -> v5.1
  if (state.header !== null) {
    Object.keys(state.origins).forEach((origin) => {
      state.origins[origin].header = true
      state.origins[origin].path = true
      delete state.origins[origin].csp
      delete state.origins[origin].encoding
    })
    state.header = null
  }
  if (state.content.scroll !== undefined) {
    delete state.content.scroll
  }
  if (state.settings === undefined) {
    state.settings = {
      icon: state.icon === true ? 'light' : 'dark',
      theme: 'light'
    }
  }
}
