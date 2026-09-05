
var files = (() => {
  var strip = (url) => url.replace(/[#?].*$/, '')
  var dir = (url) => strip(url).replace(/[^\/]*$/, '')
  var parent = (url) => url.replace(/[^\/]+\/$/, '')
  var decode = (url) => {
    try {
      return decodeURIComponent(url)
    }
    catch (err) {
      return url
    }
  }
  var same = (a, b) => a === b || decode(a) === decode(b)
  var basename = (url) => {
    try {
      return decodeURIComponent(url.replace(/\/$/, '').split('/').pop())
    }
    catch (err) {
      return url.replace(/\/$/, '').split('/').pop()
    }
  }

  var key = 'md-files'
  var st = {
    root: '',
    current: '',
    open: {},
    tree: {},
    loading: {},
  }

  var save = () => {
    try {
      localStorage.setItem(key, JSON.stringify({
        root: st.root,
        open: Object.keys(st.open).filter((url) => st.open[url]),
      }))
    }
    catch (err) {}
  }

  var restore = () => {
    try {
      return JSON.parse(localStorage.getItem(key)) || {}
    }
    catch (err) {
      return {}
    }
  }

  var load = (url) => {
    if (st.tree[url] || st.loading[url]) {
      return
    }
    st.loading[url] = true
    chrome.runtime.sendMessage({message: 'files', url}, (res) => {
      delete st.loading[url]
      st.tree[url] = res || {err: chrome.runtime.lastError ? chrome.runtime.lastError.message : 'No response'}
      m.redraw()
    })
  }

  var init = () => {
    st.current = strip(location.href)
    var current = dir(location.href)
    var saved = restore()

    // keep the previously chosen root when the current file lives under it
    st.root = saved.root && current.indexOf(saved.root) === 0 ? saved.root : current
    ;(saved.open || []).forEach((url) => st.open[url] = true)

    // open every folder between the root and the current file
    var path = st.root
    current.slice(st.root.length).split('/').filter(Boolean).forEach((part) => {
      path += part + '/'
      st.open[path] = true
    })

    save()
  }

  var events = {
    up: (e) => {
      e.preventDefault()
      if (st.root === 'file:///') {
        return
      }
      st.open[st.root] = true
      st.root = parent(st.root)
      save()
    },
    toggle: (url) => (e) => {
      e.preventDefault()
      st.open[url] = !st.open[url]
      save()
    },
  }

  var tree = (url) => {
    load(url)
    var node = st.tree[url]
    if (!node) {
      return m('._info', 'Loading…')
    }
    if (node.err) {
      return m('._info._error', {title: node.err}, 'Cannot read folder')
    }
    if (!node.dirs.length && !node.files.length) {
      return m('._info', 'No markdown files')
    }
    return [
      node.dirs.map((entry) =>
        m('._dir', {key: entry.url, class: st.open[entry.url] ? '_open' : ''}, [
          m('a', {href: entry.url, title: entry.name, onclick: events.toggle(entry.url)}, [
            m('span._caret'),
            m('span._label', entry.name),
          ]),
          st.open[entry.url] ? m('._ul', tree(entry.url)) : null,
        ])
      ),
      node.files.map((entry) =>
        m('._file', {key: entry.url, class: same(entry.url, st.current) ? '_active' : ''},
          m('a', {href: entry.url, title: entry.name}, m('span._label', entry.name))
        )
      ),
    ]
  }

  return {
    oninit: init,
    view: () =>
      m('#_files.tex2jax-ignore', [
        m('._header', [
          m('a._up', {
            href: parent(st.root),
            title: 'Parent folder',
            class: st.root === 'file:///' ? '_disabled' : '',
            onclick: events.up,
          }, '↑'),
          m('span._name', {title: st.root}, basename(st.root) || st.root),
        ]),
        m('._tree', tree(st.root)),
      ])
  }
})()
