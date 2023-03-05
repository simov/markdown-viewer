
var scroll = (() => {
  function race (done) {
    Promise.race([
      Promise.all([
        new Promise((resolve) => {
          var images = Array.from(document.querySelectorAll('img'))
          if (!images.length) {
            resolve()
          }
          else {
            var loaded = 0
            images.forEach((img) => {
              img.addEventListener('load', () => {
                if (++loaded === images.length) {
                  resolve()
                }
              }, {once: true})
            })
          }
        }),
        new Promise((resolve) => {
          var code = Array.from(document.querySelectorAll('code[class^=language-]'))
          if (!state.content.syntax || !code.length) {
            resolve()
          }
          else {
            setTimeout(() => resolve(), 40)
          }
        }),
        new Promise((resolve) => {
          var diagrams = Array.from(document.querySelectorAll('code.mermaid'))
          if (!state.content.mermaid || !diagrams.length) {
            resolve()
          }
          else {
            var timeout = setInterval(() => {
              var svg = Array.from(document.querySelectorAll('code.mermaid svg'))
              if (diagrams.length === svg.length) {
                clearInterval(timeout)
                resolve()
              }
            }, 50)
          }
        }),
        new Promise((resolve) => {
          if (!state.content.mathjax) {
            resolve()
          }
          else {
            var timeout = setInterval(() => {
              if (mj.loaded) {
                clearInterval(timeout)
                resolve()
              }
            }, 50)
          }
        })
      ]),
      new Promise((resolve) => setTimeout(resolve, 500))
    ])
    .then(done)
  }
  function listen (container, done) {
    var listener = /html|body/i.test(container.nodeName) ? window : container
    var timeout = null
    listener.addEventListener('scroll', () => {
      clearTimeout(timeout)
      timeout = setTimeout(done, 100)
    })
  }
  function get (container, prefix, offset) {
    var key = prefix + location.origin + location.pathname
    if (offset) {
      container.scrollTop = offset
      return
    }
    try {
      container.scrollTop = parseInt(localStorage.getItem(key))
    }
    catch (err) {
      chrome.storage.local.get(key, (res) => {
        container.scrollTop = parseInt(res[key])
      })
    }
  }
  function set (container, prefix) {
    var key = prefix + location.origin + location.pathname
    try {
      listen(container, () => {
        localStorage.setItem(key, container.scrollTop)
      })
    }
    catch (err) {
      listen(container, () => {
        chrome.storage.local.set({[key]: container.scrollTop})
      })
    }
  }
  var listening = false
  return (update) => {
    race(() => {
      var container = ((html = $('html')) => (
        html.scrollTop = 1,
        html.scrollTop ? (html.scrollTop = 0, html) : $('body')
      ))()

      if (!update && location.hash && $(location.hash)) {
        get(container, 'md-', $(location.hash).offsetTop)
      }
      else {
        get(container, 'md-')
      }

      if (state.content.toc) {
        setTimeout(() => get($('#_toc'), 'md-toc-'), 10)
      }

      if (!listening) {
        listening = true
        set(container, 'md-')
        if (state.content.toc) {
          setTimeout(() => set($('#_toc'), 'md-toc-'), 10)
        }
      }
    })
  }
})()
