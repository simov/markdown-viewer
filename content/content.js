
var $ = document.querySelector.bind(document)

var state = {
  theme,
  raw,
  content,
  compiler,
  html: '',
  markdown: '',
  toc: ''
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.message === 'reload') {
    location.reload(true)
  }
  else if (req.message === 'theme') {
    state.theme = req.theme
    m.redraw()
  }
  else if (req.message === 'raw') {
    state.raw = req.raw
    m.redraw()
  }
})

var oncreate = {
  markdown: () => {
    scroll()
  },
  html: () => {
    scroll()

    if (state.content.toc && !state.toc) {
      state.toc = toc()
      m.redraw()
    }

    setTimeout(() => Prism.highlightAll(), 20)

    anchors()
  }
}

function mount () {
  $('pre').style.display = 'none'
  var md = $('pre').innerText

  m.mount($('body'), {
    oninit: () => {
      ;((done) => {
        if (document.charset === 'UTF-8') {
          done()
          return
        }
        m.request({method: 'GET', url: location.href,
          deserialize: (body) => {
            done(body)
            return body
          }
        })
      })((data) => {
        state.markdown = data || md

        chrome.runtime.sendMessage({
          message: 'markdown',
          compiler: state.compiler,
          markdown: state.markdown
        }, (res) => {
          state.html = state.content.emoji ? emojinator(res.html) : res.html
          m.redraw()
        })
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
          dom.push(m('link#_theme [rel="stylesheet"] [type="text/css"]', {
            href: chrome.runtime.getURL('/themes/' + state.theme + '.css')
          }))
        }
        if (state.html) {
          dom.push(m('#_html', {oncreate: oncreate.html,
            class: /github(-dark)?/.test(state.theme) ? 'markdown-body' : 'markdown-theme'},
            m.trust(state.html)
          ))
          if (state.content.toc && state.toc) {
            dom.push(m.trust(state.toc))
            $('body').classList.add('_toc-left')
          }
          if (state.content.mathjax) {
            dom.push(m('script', {type: 'text/x-mathjax-config',}, `
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
            `))
            dom.push(m('script', {
              src: 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js'
            }))
          }
        }
      }

      return (dom.length ? dom : m('div'))
    }
  })
}

function scroll () {
  function race (done) {
    var images = Array.from(document.querySelectorAll('img'))
    if (!images.length) {
      done()
    }
    var loaded = 0
    images.forEach((img) => {
      img.addEventListener('load', () => {
        if (++loaded === images.length) {
          done()
        }
      }, {once: true})
    })
    setTimeout(done, 100)
  }
  function init () {
    if (state.content.scroll) {
      var key = 'md-' + location.origin + location.pathname
      $('body').scrollTop = parseInt(localStorage.getItem(key))

      var timeout = null
      window.addEventListener('scroll', () => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          localStorage.setItem(key, $('body').scrollTop)
        }, 100)
      })
    }
    else if (location.hash && $(location.hash)) {
      $('body').scrollTop = $(location.hash).offsetTop
    }
  }
  var loaded
  race(() => {
    if (!loaded) {
      init()
      loaded = true
    }
  })
}

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
    title: node.innerText
  }))
  .reduce((html, header, index, headers) => {
    if (index) {
      var prev = headers[index - 1]
    }
    if (!index || prev.level === header.level) {
      html += link(header)
    }
    else if (prev.level > header.level) {
      while (prev.level-- > header.level) {
        html += '</div>'
      }
      html += link(header)
    }
    else if (prev.level < header.level) {
      while (prev.level++ < header.level) {
        html += '<div id="_ul">'
      }
      html += link(header)
    }
    return html
  }, '<div id="_toc"><div id="_ul">') + '</div></div>'

if (document.readyState === 'complete') {
  mount()
}
else {
  window.addEventListener('DOMContentLoaded', mount)
}
