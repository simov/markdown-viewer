
var $ = document.querySelector.bind(document)

var state = {
  theme: args.theme,
  raw: args.raw,
  themes: args.themes,
  content: args.content,
  compiler: args.compiler,
  html: '',
  markdown: '',
  toc: '',
  interval: null,
  ms: 1000,
  _themes: {
    'github': 'auto',
    'github-dark': 'dark',
    'almond': 'light',
    'air': 'auto',
    'awsm': 'light',
    'axist': 'light',
    'bamboo': 'auto',
    'bullframe': 'light',
    'holiday': 'auto',
    'kacit': 'light',
    'latex': 'light',
    'marx': 'auto',
    'mini': 'light',
    'modest': 'auto',
    'new': 'auto',
    'no-class': 'auto',
    'pico': 'auto',
    'retro': 'dark',
    'sakura': 'light',
    'sakura-vader': 'dark',
    'semantic': 'auto',
    'simple': 'auto',
    'splendor': 'auto',
    'style-sans': 'light',
    'style-serif': 'light',
    'stylize': 'auto',
    'superstylin': 'auto',
    'tacit': 'light',
    'vanilla': 'auto',
    'water': 'light',
    'water-dark': 'dark',
    'writ': 'auto',
  }
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

    if (state.content.syntax) {
      setTimeout(() => Prism.highlightAll(), 20)
    }

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
          var included = Array.from($('body').classList).filter((name) => /^_theme/.test(name))
          if (included.length) {
            $('body').classList.remove(included)
          }
          dom.push(m('link#_theme', {
            rel: 'stylesheet', type: 'text/css',
            href: chrome.runtime.getURL(`/themes/${state.theme}.css`),
          }))
          $('body').classList.add(`_theme-${state.theme}`)

          if (state.content.syntax) {
            var prism =
              state._themes[state.theme] === 'dark' ||
              (state._themes[state.theme] === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
              ? 'prism-okaidia' : 'prism'
            dom.push(m('link#_prism', {
              rel: 'stylesheet', type: 'text/css',
              href: chrome.runtime.getURL(`/vendor/${prism}.min.css`),
            }))
          }
          if (state.content.mermaid) {
            mmd.refresh()
          }
        }
        if (state.html) {
          dom.push(m('#_html', {oncreate: oncreate.html,
            class: (/github(-dark)?/.test(state.theme) ? 'markdown-body' : 'markdown-theme') +
            (state.themes.width !== 'auto' ? ` _width-${state.themes.width}` : '')
          },
            m.trust(state.html)
          ))
          if (state.content.toc && state.toc) {
            dom.push(m('#_toc.tex2jax-ignore', {oncreate: oncreate.toc},
              m.trust(state.toc)
            ))
            $('body').classList.add('_toc-left')
          }
          if (state.content.mathjax) {
            dom.push(m('script', {
              src: chrome.runtime.getURL('/content/mathjax.js')
            }))
            dom.push(m('script', {
              src: chrome.runtime.getURL('/vendor/mathjax/tex-mml-chtml.js')
            }))
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
  return {
    body: () => {
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
