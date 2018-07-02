
// chrome.storage.sync.clear()
// chrome.permissions.getAll((p) => chrome.permissions.remove({origins: p.origins}))

md.storage = ({compilers}) => {
  var match = '\\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\\?.*)?$'

  var defaults = {
    theme: 'github',
    compiler: 'marked',
    content: {
      emoji: false,
      scroll: true,
      toc: false,
      mathjax: false,
      autoreload: false,
    },
    raw: false,
    header: true,
    match,
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

  var state = {}

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
      options.marked = compilers.marked.defaults
    }
    // v2.8 -> v2.9
    if (!options.remark) {
      options.remark = compilers.remark.defaults
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
    // v3.4 -> v3.5
    if (typeof options.origins['file://'] === 'string') {
      options.origins = Object.keys(options.origins)
        .reduce((all, key) => (all[key] = {
          match: options.origins[key],
          csp: options.csp,
          encoding: '',
      }, all), {})
    }
    if (typeof options.csp === 'boolean') {
      delete options.csp
    }
    // v3.5 -> v3.6
    if (options.content.autoreload === undefined) {
      options.content.autoreload = false
    }

    // reload extension bug
    chrome.permissions.getAll((permissions) => {
      var origins = Object.keys(res.origins || {})
      chrome.permissions.remove({
        origins: permissions.origins
          .filter((origin) => origins.indexOf(origin.slice(0, -2)) === -1)
      })
    })

    Object.keys(compilers).forEach((compiler) => {
      if (!options[compiler]) {
        options[compiler] = compilers[compiler].defaults
      }
    })

    chrome.storage.sync.set(options)
    Object.assign(state, JSON.parse(JSON.stringify(options)))
  })

  return {defaults, state, set}
}
