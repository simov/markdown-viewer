
var $ = document.querySelector.bind(document)

var state = {
  theme: window['theme'] || '',
  html: '',
  markdown: '',
  raw: window['raw'] || false,
  getURL: () => chrome.runtime.getURL('/themes/' + state.theme + '.css')
}

if (!state.theme) { // file://
  chrome.runtime.sendMessage({message: 'settings'}, (res) => {
    state.theme = res.theme
    state.raw = res.raw
    m.redraw()
  })
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
    document.body.scrollTop = parseInt(localStorage.getItem('scrolltop'))
  },
  html: () => {
    document.body.scrollTop = parseInt(localStorage.getItem('scrolltop'))
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
        updateStyles()
        dom.push(m('pre#markdown', {oncreate: oncreate.markdown}, state.markdown))
      }
      if (state.theme && !state.raw) {
        updateStyles()
        dom.push(m('link#theme [rel="stylesheet"] [type="text/css"]', {
          href: state.getURL()
        }))
      }
      if (state.html && !state.raw) {
        dom.push(m('#html', {oncreate: oncreate.html}, m.trust(state.html)))
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
        localStorage.setItem('scrolltop', document.body.scrollTop)
      }, 100)
    })
    document.body.scrollTop = parseInt(localStorage.getItem('scrolltop'))
  }, 100)
}

if (document.readyState === 'complete') {
  mount()
  scroll()
}
else {
  window.addEventListener('DOMContentLoaded', mount)
  window.addEventListener('load', scroll)
}

function updateStyles () {
  if (state.raw) {
    $('html').classList.remove('markdown-theme-html')
    $('body').classList.remove('markdown-theme')
    $('html').classList.remove('markdown-body-html')
    $('body').classList.remove('markdown-body')
  }
  else if (/github(-dark)?/.test(state.theme)) {
    $('html').classList.remove('markdown-theme-html')
    $('body').classList.remove('markdown-theme')
    $('html').classList.add('markdown-body-html')
    $('body').classList.add('markdown-body')
  }
  else {
    $('html').classList.remove('markdown-body-html')
    $('body').classList.remove('markdown-body')
    $('html').classList.add('markdown-theme-html')
    $('body').classList.add('markdown-theme')
  }
}
