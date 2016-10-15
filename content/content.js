
var $ = document.querySelector.bind(document)

var state = {
  theme: '',
  html: '',
  markdown: '',
  raw: false,
  getURL: () => chrome.extension.getURL('/themes/' + state.theme + '.css')
}

chrome.extension.sendMessage({message: 'settings'}, (data) => {
  state.theme = data.theme
  state.raw = data.raw
  m.redraw()
})

chrome.extension.onMessage.addListener((req, sender, sendResponse) => {
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

function mount () {
  $('pre').style.display = 'none'

  m.mount($('body'), {
    controller: function () {
      ;((done) => {
        if (document.charset === 'UTF-8') {
          done()
          return
        }
        m.request({url: window.location.href,
          deserialize: (body) => {
            done(body)
            return body
          }
        })
      })((data) => {
        state.markdown = data || $('pre').innerText

        chrome.extension.sendMessage({
          message: 'markdown',
          markdown: state.markdown
        }, (res) => {
          state.html = res.marked
          m.redraw()
        })
      })

      return {
        markdown: (element, initialized, context) => {
          if (!initialized) {
            document.body.scrollTop = parseInt(localStorage.getItem('scrolltop'))
          }
        },
        html: (element, initialized, context) => {
          if (!initialized) {
            document.body.scrollTop = parseInt(localStorage.getItem('scrolltop'))
            setTimeout(() => Prism.highlightAll(), 20)
          }
        }
      }
    },
    view: (ctrl) => {
      var dom = []

      if (state.raw) {
        updateStyles()
        dom.push(m('pre#markdown', {config: ctrl.markdown}, state.markdown))
      }
      if (state.theme && !state.raw) {
        updateStyles()
        dom.push(m('link#theme [rel="stylesheet"] [type="text/css"]',
          {href: state.getURL()}))
      }
      if (state.html && !state.raw) {
        dom.push(m('#html', {config: ctrl.html}, m.trust(state.html)))
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
