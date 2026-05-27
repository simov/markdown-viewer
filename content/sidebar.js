
/*
  File tree sidebar + folder path top bar.
  Only active on file:// pages, where a directory can be listed by fetching
  Chrome's auto-generated directory listing (done in the background, since
  content scripts can't fetch file:// directly).

  Folder clicks navigate (the tab opens that folder's index.md, or the parent's
  on collapse), so the tree root and the set of expanded folders are persisted
  in chrome.storage.local to survive the reload.
*/
var sidebar = (() => {

  var MD = /\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:[?#].*)?$/i
  var HTML = /\.(?:html?|xhtml)(?:[?#].*)?$/i
  // files this extension shows with the sidebar (markdown + html)
  var DOC = (name) => MD.test(name) || HTML.test(name)

  var KEYS = ['md-sidebar-mdonly', 'md-sidebar-root', 'md-sidebar-expanded']

  var data = {
    inited: false,
    rootUrl: '',      // stable workspace root      (file://…/, trailing slash)
    rootName: '',     // root basename              (sidebar head)
    folderPath: '',   // current folder, decoded    (top bar)
    currentFolder: '',// current folder url         (search scope)
    currentHref: '',  // current file/folder href, decoded (highlight)
    mdOnly: true,
    error: '',
    tree: null,       // null = loading, [] = empty, [node, ...] = entries
    expanded: {},     // {folderUrl: true}
    search: '',       // current search query
    searchAll: null,  // flat node list under currentFolder; null = not loaded
    searchLoading: false,
  }

  // url helpers (all folder urls keep a trailing slash)
  var folderOf = (url) => url.replace(/[?#].*$/, '').replace(/[^/]*$/, '')
  var parentOf = (folderUrl) => folderUrl.replace(/\/$/, '').replace(/\/[^/]*$/, '/')
  var within = (url, root) => url.indexOf(root) === 0
  var decode = (folderUrl) =>
    decodeURIComponent(folderUrl.replace(/^file:\/\//, '').replace(/\/$/, '')) || '/'

  // node: {name, url, isDir, children}
  var node = (entry, parentUrl) => ({
    name: entry.name,
    url: parentUrl + entry.href + (entry.isDir ? '/' : ''),
    isDir: entry.isDir,
    children: null,
  })

  // Chrome emits one `addRow("name","href",isDir,"size","date");` per entry
  // into the raw listing HTML, before any of its own JS runs.
  var parseListing = (html, baseUrl) => {
    var entries = []
    var re = /addRow\("((?:[^"\\]|\\.)*)","((?:[^"\\]|\\.)*)",(\d)/g
    var match
    while ((match = re.exec(html))) {
      var name = JSON.parse('"' + match[1] + '"')
      // skip . / .. and dotfiles like .DS_Store, .git, .vscode
      if (name.charAt(0) === '.') continue
      entries.push({name, href: match[2], isDir: match[3] === '1'})
    }
    entries.sort((a, b) =>
      a.isDir !== b.isDir ? (a.isDir ? -1 : 1) : a.name.localeCompare(b.name)
    )
    return entries.map((e) => node(e, baseUrl))
  }

  var loadDir = (url) =>
    new Promise((resolve) => {
      chrome.runtime.sendMessage({message: 'listdir', location: url}, (res) => {
        resolve(!res || res.err
          ? {err: res ? res.err : 'no response'}
          : {entries: parseListing(res.body, url)})
      })
    })

  var save = () => chrome.storage.local.set({
    'md-sidebar-root': data.rootUrl,
    'md-sidebar-expanded': Object.keys(data.expanded),
  })

  // expand the chain from current folder up to (but excluding) the root, so the
  // current file is always visible
  var expandPath = (folder) => {
    var u = folder
    while (within(u, data.rootUrl) && u !== data.rootUrl) {
      data.expanded[u] = true
      u = parentOf(u)
    }
  }

  // load children for every expanded folder reachable from the given nodes
  var expandLoaded = (nodes) =>
    Promise.all(nodes
      .filter((n) => n.isDir && data.expanded[n.url])
      .map((n) =>
        loadDir(n.url).then((res) => {
          n.children = res.err ? [] : res.entries
          return expandLoaded(n.children)
        })
      ))

  // recursive load of every subdirectory under folderUrl (for search)
  var loadAll = (folderUrl) =>
    loadDir(folderUrl).then((res) => {
      if (res.err) return []
      var entries = res.entries
      return Promise.all(entries
        .filter((n) => n.isDir)
        .map((n) => loadAll(n.url).then((kids) => { n.children = kids }))
      ).then(() => entries)
    })

  var flatten = (nodes) => {
    var out = []
    nodes.forEach((n) => {
      out.push(n)
      if (n.isDir && n.children) out.push.apply(out, flatten(n.children))
    })
    return out
  }

  var init = () => {
    if (data.inited || location.protocol !== 'file:') return
    data.inited = true

    var href = location.href.replace(/[?#].*$/, '')
    data.currentHref = decodeURIComponent(href)
    var currentFolder = folderOf(href)
    data.currentFolder = currentFolder
    data.folderPath = decode(currentFolder)

    chrome.storage.local.get(KEYS, (res) => {
      if (typeof res['md-sidebar-mdonly'] === 'boolean') {
        data.mdOnly = res['md-sidebar-mdonly']
      }

      var storedRoot = res['md-sidebar-root']
      // keep the stored root while navigating inside it; otherwise re-root here
      if (storedRoot && within(currentFolder, storedRoot)) {
        data.rootUrl = storedRoot
        data.expanded = (res['md-sidebar-expanded'] || [])
          .reduce((all, u) => (all[u] = true, all), {})
      }
      else {
        data.rootUrl = currentFolder
        data.expanded = {}
        save()
      }

      data.rootName = decode(data.rootUrl).split('/').pop() || '/'
      expandPath(currentFolder)
      m.redraw()

      loadDir(data.rootUrl).then((res) => {
        if (res.err) { data.error = res.err; m.redraw(); return }
        data.tree = res.entries
        return expandLoaded(data.tree).then(() => m.redraw())
      })
    })
  }

  // folder click: expand -> open the folder; collapse -> open its parent.
  // both navigate, so persist first, then go (storage write may be async).
  var clickFolder = (n) => {
    var open
    if (data.expanded[n.url]) {
      delete data.expanded[n.url]
      open = parentOf(n.url)
    }
    else {
      data.expanded[n.url] = true
      open = n.url
    }
    chrome.storage.local.set({
      'md-sidebar-root': data.rootUrl,
      'md-sidebar-expanded': Object.keys(data.expanded),
    }, () => { location.href = open })
  }

  var setMdOnly = (val) => {
    data.mdOnly = val
    chrome.storage.local.set({'md-sidebar-mdonly': val})
  }

  // lazy-load the recursive listing the first time the user types
  var onSearch = (q) => {
    data.search = q
    if (q && data.searchAll === null && !data.searchLoading) {
      data.searchLoading = true
      loadAll(data.currentFolder).then((nodes) => {
        data.searchAll = flatten(nodes)
        data.searchLoading = false
        m.redraw()
      })
    }
  }

  // path of n relative to the current folder, without the trailing name
  var relDir = (n) => {
    var rel = n.url.replace(data.currentFolder, '')
    rel = decodeURIComponent(rel).replace(/\/$/, '')
    var slash = rel.lastIndexOf('/')
    return slash > 0 ? rel.slice(0, slash) : ''
  }

  var visible = (n) => n.isDir || !data.mdOnly || DOC(n.name)
  var isActive = (n) => decodeURIComponent(n.url) === data.currentHref

  var rows = (nodes, depth) =>
    nodes.filter(visible).map((n) => [
      m('.md-sb-row', {
        class: isActive(n) ? 'md-sb-active' : '',
        style: 'padding-left:' + (6 + depth * 14) + 'px',
        title: n.name,
        onclick: () => n.isDir ? clickFolder(n) : (location.href = n.url),
      },
        m('span.md-sb-caret', n.isDir ? (data.expanded[n.url] ? '▾' : '▸') : ''),
        m('span.md-sb-icon', n.isDir ? '📁' : HTML.test(n.name) ? '🌐' : MD.test(n.name) ? '📄' : '🗎'),
        m('span.md-sb-name', n.name)
      ),
      n.isDir && data.expanded[n.url]
        ? (n.children
            ? rows(n.children, depth + 1)
            : m('.md-sb-note', {style: 'padding-left:' + (6 + (depth + 1) * 14) + 'px'}, 'Loading…'))
        : null,
    ])

  // opens the WYSIWYG editor on a chrome-extension:// page (FSA works there;
  // it's blocked on this file:// page's opaque origin)
  var openEditor = () => {
    var path = decodeURIComponent(location.pathname)
    chrome.runtime.sendMessage({message: 'edit.open', path: path})
  }

  var topbar = () =>
    m('#_md_topbar.tex2jax-ignore',
      m('span.md-tb-icon', '📂'),
      m('span.md-tb-path', {title: data.folderPath}, data.folderPath),
      MD.test(data.currentHref)
        ? m('button.md-tb-edit', {onclick: openEditor, title: 'Edit this file'}, '✎ Edit')
        : null
    )

  var searchRows = () => {
    if (data.searchAll === null) return m('.md-sb-note', 'Searching…')
    var q = data.search.toLowerCase()
    var matches = data.searchAll
      .filter((n) => visible(n) && n.name.toLowerCase().indexOf(q) !== -1)
    if (!matches.length) return m('.md-sb-note', 'No matches')
    return matches.slice(0, 200).map((n) => {
      var dir = relDir(n)
      return m('.md-sb-row.md-sb-result', {
        class: isActive(n) ? 'md-sb-active' : '',
        title: decodeURIComponent(n.url),
        onclick: () => n.isDir ? clickFolder(n) : (location.href = n.url),
      },
        m('span.md-sb-icon', n.isDir ? '📁' : HTML.test(n.name) ? '🌐' : MD.test(n.name) ? '📄' : '🗎'),
        m('span.md-sb-name', n.name),
        dir ? m('span.md-sb-relpath', dir) : null
      )
    })
  }

  var tree = () =>
    m('#_md_sidebar.tex2jax-ignore',
      m('.md-sb-head',
        m('span.md-sb-title', {title: decode(data.rootUrl)}, data.rootName),
        m('.md-sb-toggle',
          m('button', {class: data.mdOnly ? 'on' : '', onclick: () => setMdOnly(true)}, 'Docs'),
          m('button', {class: !data.mdOnly ? 'on' : '', onclick: () => setMdOnly(false)}, 'All')
        )
      ),
      m('.md-sb-search',
        m('input', {
          type: 'search',
          placeholder: 'Search files…',
          value: data.search,
          oninput: (e) => onSearch(e.target.value),
          onkeydown: (e) => { if (e.key === 'Escape') onSearch('') },
        })
      ),
      m('.md-sb-tree',
        data.error ? m('.md-sb-note', 'Could not read folder')
        : data.search ? searchRows()
        : data.tree === null ? m('.md-sb-note', 'Loading…')
        : data.tree.length === 0 ? m('.md-sb-note', 'Empty folder')
        : rows(data.tree, 0)
      )
    )

  // for html pages / folder listings: mount the sidebar into its own host
  // element so the page's own rendered html (in <body>) is left untouched
  var mountStandalone = () => {
    var host = document.createElement('div')
    host.id = '_md_chrome'
    document.body.appendChild(host)
    document.body.classList.add('_md-topbar', '_md-sidebar')
    init()
    m.mount(host, {view: () => [topbar(), tree()]})
  }

  return {
    init,
    topbar,
    tree,
    loadDir,
    mountStandalone,
    get active () { return location.protocol === 'file:' },
  }
})()
