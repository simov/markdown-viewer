
var $ = document.querySelector.bind(document)

var state = {
  theme,
  raw,
  themes,
  content,
  compiler,
  html: '',
  markdown: '',
  toc: '',
  interval: null,
  ms: 1000,
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.message === 'reload') {
    location.reload(true)
  }
  else if (req.message === 'theme') {
    state.theme = req.theme
    m.redraw()
  }
  else if (req.message === 'themes') {
    state.themes = req.themes
    m.redraw()
  }
  else if (req.message === 'raw') {
    state.raw = req.raw
    m.redraw()
  }
  else if (req.message === 'autoreload') {
    clearInterval(state.interval)
  }
})

var oncreate = {
  markdown: () => {
    scroll.body()
  },
  html: () => {
    scroll.body()

    if (state.content.toc && !state.toc) {
      state.toc = toc()
      m.redraw()
    }

    setTimeout(() => Prism.highlightAll(), 20)

    anchors()
  },
  toc: () => {
    scroll.toc()
  }
}

function mount () {
  $('pre').style.display = 'none'
  var md = $('pre').innerText

  m.mount($('body'), {
    oninit: () => {
      state.markdown = md
      chrome.runtime.sendMessage({
        message: 'markdown',
        compiler: state.compiler,
        markdown: state.markdown
      }, (res) => {
        state.html = state.content.emoji ? emojinator(res.html) : res.html
        m.redraw()
      })
    },
    view: () => {
      var dom = []

      if (state.raw) {
        dom.push(m('pre#_markdown', {oncreate: oncreate.markdown}, state.markdown))
        $('body').classList.remove('_toc-left', '_toc-right')
      }
      else {
        if (state.theme) {
          dom.push(m('link#_theme', {
            rel: 'stylesheet', type: 'text/css',
            href: chrome.runtime.getURL(`/themes/${state.theme}.css`),
          }))
        }
        if (state.html) {
          dom.push(m('#_html', {oncreate: oncreate.html,
            class: (/github(-dark)?/.test(state.theme) ? 'markdown-body' : 'markdown-theme') +
            (state.themes.wide ? ' wide-theme' : '')
          },
            m.trust(state.html)
          ))
          if (state.content.toc && state.toc) {
            dom.push(m('#_toc', {oncreate: oncreate.toc},
              m.trust(state.toc)
            ))
            $('body').classList.add('_toc-left')
          }
          if (state.content.mathjax) {
            dom.push(m('script', {type: 'text/x-mathjax-config'}, mathjax))
            dom.push(m('script', {
              src: 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js'
            }))
          }
          if (state.content.mermaid) {
            dom.push(m('script', {
              src: 'https://cdnjs.cloudflare.com/ajax/libs/mermaid/8.8.4/mermaid.min.js'
            }))
            dom.push(m('script', {type: 'text/javascript'}, `
              ;(() => {
                var timeout = setInterval(() => {
                  if (!!(window.mermaid && mermaid.init)) {
                    clearInterval(timeout)
                    mermaid.init({}, 'code.language-mmd, code.language-mermaid')
                  }
                }, 50)
              })()
            `))
          }
        }
      }

      return (dom.length ? dom : m('div'))
    }
  })
}

var scroll = (() => {
  function race (done) {
    Promise.race([
      Promise.all([
        new Promise((resolve) => {
          var diagrams = Array.from(document.querySelectorAll('code.language-mmd, code.language-mermaid'))
          if (!state.content.mermaid || !diagrams.length) {
            resolve()
          }
          else {
            var timeout = setInterval(() => {
              var svg = Array.from(document.querySelectorAll('code.language-mmd svg, code.language-mermaid svg'))
              if (diagrams.length === svg.length) {
                clearInterval(timeout)
                resolve()
              }
            }, 50)
          }
        }),
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
      ]),
      new Promise((resolve) => setTimeout(resolve, 500))
    ])
    .then(done)
  }
  function debounce (container, done) {
    var listener = /html/i.test(container.nodeName) ? window : container
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
  return {
    body: () => {
      var loaded
      race(() => {
        if (!loaded) {
          loaded = true
          if (state.content.scroll) {
            listen($('html'), 'md-')
          }
          else if (location.hash && $(location.hash)) {
            $('html').scrollTop = $(location.hash).offsetTop
          }
        }
      })
    },
    toc: () => {
      listen($('#_toc'), 'md-toc-')
    }
  }
})()

function anchors () {
  Array.from($('#_html').childNodes)
  .filter((node) => /h[1-6]/i.test(node.tagName))
  .forEach((node) => {
    var a = document.createElement('a')
    a.className = 'anchor'
    a.name = node.id
    a.href = '#' + node.id
    a.innerHTML = '<span class="octicon octicon-link"></span>'
    node.prepend(a)
  })
}

var toc = (
  link = (header) => '<a href="#' + header.id + '">' + header.title + '</a>') =>
  Array.from($('#_html').childNodes)
  .filter((node) => /h[1-6]/i.test(node.tagName))
  .map((node) => ({
    id: node.getAttribute('id'),
    level: parseInt(node.tagName.replace('H', '')),
    title: node.innerText.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }))
  .reduce((html, header) => {
    html += '<div class="_ul">'.repeat(header.level)
    html += link(header)
    html += '</div>'.repeat(header.level)
    return html
  }, '')

if (document.readyState === 'complete') {
  mount()
}
else {
  var timeout = setInterval(() => {
    if (document.readyState === 'complete') {
      clearInterval(timeout)
      mount()
    }
  }, 0)
}

if (state.content.autoreload) {
  ;(() => {
    var initial = ''

    var response = (body) => {
      if (!initial) {
        initial = body
      }
      else if (initial !== body) {
        location.reload(true)
      }
    }

    var xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        response(xhr.responseText)
      }
    }

    var get = () => {
      if (location.protocol === 'file:') {
        chrome.runtime.sendMessage({
          message: 'autoreload',
          location: location.href
        }, (res) => {
          if (res.err) {
            console.error(res.err)
            clearInterval(state.interval)
          }
          else {
            response(res.body)
          }
        })
      }
      else {
        xhr.open('GET', location.href + '?preventCache=' + Date.now(), true)
        try {
          xhr.send()
        }
        catch (err) {
          console.error(err)
          clearInterval(state.interval)
        }
      }
    }

    get()
    state.interval = setInterval(get, state.ms)
  })()
}

var mathjax = `
  // TeX-AMS_HTML
  MathJax.Hub.Config({
    jax: [
      'input/TeX',
      'output/HTML-CSS',
      'output/PreviewHTML',
    ],
    extensions: [
      'tex2jax.js',
      'AssistiveMML.js',
      'a11y/accessibility-menu.js',
    ],
    TeX: {
      extensions: [
        'AMSmath.js',
        'AMSsymbols.js',
        'noErrors.js',
        'noUndefined.js',
      ]
    },
    tex2jax: {
      inlineMath: [
        ['$', '$'],
        ['\\\\(', '\\\\)'],
      ],
      displayMath: [
        ['$$', '$$'],
        ['\\\\[', '\\\\]'],
      ],
      processEscapes: true
    },
    showMathMenu: false,
    showProcessingMessages: false,
    messageStyle: 'none',
    skipStartupTypeset: true, // disable initial rendering
    positionToHash: false
  })
  // set specific container to render, can be delayed too
  MathJax.Hub.Queue(
    ['Typeset', MathJax.Hub, '_html']
  )
`
