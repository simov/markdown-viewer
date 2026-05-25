
/*
  Injected into browser-rendered local pages (file://) that we still want the
  sidebar on: .html files and folder listings. The browser renders the page
  itself, so we only add the sidebar overlay and leave <body> intact.

  For a folder: auto-open index.md if present, otherwise show the sidebar over a
  blank content area ("open nothing").
*/
;(() => {
  if (window.__mdSidebar) return
  window.__mdSidebar = true

  var isFolder = /\/$/.test(location.pathname)

  if (isFolder) {
    var root = location.href.replace(/[?#].*$/, '')
    sidebar.loadDir(root).then((res) => {
      var index = (res.entries || []).find(
        (n) => !n.isDir && n.name.toLowerCase() === 'index.md'
      )
      // replace() so back doesn't bounce folder -> index.md -> folder
      if (index) {
        location.replace(index.url)
        return
      }
      mount(true) // no index.md: sidebar only, blank the native listing
    })
    return
  }

  mount(false)

  function mount (blank) {
    var go = () => {
      if (!document.body) {
        setTimeout(go, 10)
        return
      }
      if (blank) {
        document.body.classList.add('_md-blank')
      }
      sidebar.mountStandalone() // appends its own host after, so it stays visible
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', go, {once: true})
    }
    else {
      go()
    }
  }
})()
