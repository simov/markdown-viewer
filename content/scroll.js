
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
  function debounce (container, done) {
    var listener = /html|body/i.test(container.nodeName) ? window : container
    var timeout = null
    listener.addEventListener('scroll', () => {
      clearTimeout(timeout)
      timeout = setTimeout(done, 100)
    })
  }
  function listen (container, prefix) {
    var key = prefix + location.origin + location.pathname
    try {
      container.scrollTop = parseInt(localStorage.getItem(key))
      debounce(container, () => {
        localStorage.setItem(key, container.scrollTop)
      })
    }
    catch (err) {
      chrome.storage.local.get(key, (res) => {
        container.scrollTop = parseInt(res[key])
      })
      debounce(container, () => {
        chrome.storage.local.set({[key]: container.scrollTop})
      })
    }
  }
  return () => {
    var loaded
    race(() => {
      if (!loaded) {
        loaded = true
        var container = ((html = $('html')) => (
          html.scrollTop = 1,
          html.scrollTop ? (html.scrollTop = 0, html) : $('body')
        ))()
        if (state.content.scroll) {
          listen(container, 'md-')
        }
        else if (location.hash && $(location.hash)) {
          container.scrollTop = $(location.hash).offsetTop
        }
        if (state.content.toc) {
          setTimeout(() => listen($('#_toc'), 'md-toc-'), 10)
        }
      }
    })
  }
})()
