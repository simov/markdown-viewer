
var $ = document.querySelector.bind(document)

var state = {
  theme: window['theme'] || '',
  html: '',
  markdown: '',
  raw: window['raw'] || false,
  content: window['content'] || {},
  toc: '',
  getURL: () => chrome.runtime.getURL('/themes/' + state.theme + '.css')
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.message === 'reload') {
    window.location.reload(true)
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
    if (state.content.scroll) {
      document.body.scrollTop = parseInt(localStorage.getItem('md-' + location.href))
    }
  },
  html: () => {
    if (state.content.scroll) {
      document.body.scrollTop = parseInt(localStorage.getItem('md-' + location.href))
    }
    if (state.content.toc && !state.toc) {
      state.toc = toc()
      m.redraw()
    }
    setTimeout(() => Prism.highlightAll(), 20)
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
        m.request({method: 'GET', url: window.location.href,
          deserialize: (body) => {
            done(body)
            return body
          }
        })
      })((data) => {
        state.markdown = data || md

        chrome.runtime.sendMessage({
          message: 'markdown',
          markdown: state.markdown
        }, (res) => {
          state.html = res.marked
          m.redraw()
        })
      })
    },
    view: () => {
      var dom = []

      if (state.raw) {
        dom.push(m('pre#markdown', {oncreate: oncreate.markdown}, state.markdown))
        $('body').classList.remove('_toc-left', '_toc-right')
      }
      if (state.theme && !state.raw) {
        dom.push(m('link#theme [rel="stylesheet"] [type="text/css"]', {
          href: state.getURL()
        }))
      }
      if (state.html && !state.raw) {
        dom.push(
          m('#html', {oncreate: oncreate.html,
            class: /github(-dark)?/.test(state.theme) ? 'markdown-body' : 'markdown-theme'},
            m.trust(state.html))
        )
        if (state.content.toc && state.toc) {
          dom.push(m.trust(state.toc))
          // TODO: should be configurable
          $('body').classList.add('_toc-left')
        }
      }

      return (dom.length ? dom : m('div'))
    }
  })
}

function scroll () {
  setTimeout(() => {
    var timeout = null
    window.addEventListener('scroll', () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        localStorage.setItem('md-' + location.href, document.body.scrollTop)
      }, 100)
    })
    document.body.scrollTop = parseInt(localStorage.getItem('md-' + location.href))
  }, 100)
}

if (document.readyState === 'complete') {
  mount()
  if (state.content.scroll) {
    scroll()
  }
}
else {
  window.addEventListener('DOMContentLoaded', mount)
  if (state.content.scroll) {
    window.addEventListener('load', scroll)
  }
}

function toc () {
  // extract all headers

  var headers = []

  function walk (nodes) {
    nodes.forEach((node) => {
      var sub = Array.from(node.childNodes)
      if (sub.length) {
        walk(sub)
      }
      if (/h[1-6]/i.test(node.tagName)) {
        headers.push({
          id: node.getAttribute('id'),
          level: parseInt(node.tagName.replace('H', '')),
          title: node.innerText
        })
      }
    })
  }

  walk(Array.from($('body').childNodes))

  // generate TOC

  var link = (header) =>
    '<a href="#' + header.id + '">' + header.title + '</a>'

  var html = '<div id="_toc"><div id="_ul">'

  headers.forEach((header, index) => {
    if (index) {
      var prev = headers[index - 1]
    }
    if (!index || prev.level === header.level) {
      html += link(header)
    }
    else if (prev.level > header.level) {
      html += '</div>' + link(header)
    }
    else if (prev.level < header.level) {
      html += '<div id="_ul">' + link(header)
    }
  })

  html += '</div></div>'

  return html
}
