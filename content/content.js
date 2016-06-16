
window.addEventListener('DOMContentLoaded', () => {
  var $ = document.querySelector.bind(document)

  m.mount($('body'), {
    controller: function () {
      var state = {
        theme: '',
        html: '',
        markdown: $('pre').innerText,
        raw: false,
        getURL: () => chrome.extension.getURL('/themes/' + state.theme + '.css')
      }

      setTimeout(() => {
        chrome.extension.sendMessage({message: 'settings'}, (data) => {
          state.theme = data.theme
          state.raw = data.raw
          m.redraw()

          setTimeout(() => {
            chrome.extension.sendMessage({
              message: 'markdown',
              markdown: state.markdown
            }, (res) => {
              state.html = res.marked
              m.redraw()
            })
          }, 0)
        })
      }, 0)

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

      return {
        state: state,
        config: (element, initialized, context) => {
          if (!initialized) {
            Prism.highlightAll()
          }
        },
        updateStyles: (theme) => {
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
      }
    },
    view: (ctrl) => {
      var state = ctrl.state

      var dom = []

      if (state.raw) {
        ctrl.updateStyles()
        dom.push(m('pre#markdown', state.markdown))
      }
      if (state.theme && !state.raw) {
        ctrl.updateStyles()
        dom.push(m('link#theme [rel="stylesheet"] [type="text/css"]',
          {href: state.getURL()}))
      }
      if (state.html && !state.raw) {
        dom.push(m('#html', {config: ctrl.config}, m.trust(state.html)))
      }

      return (dom.length ? dom : m('div'))
    }
  })
})

window.addEventListener('load', () => setTimeout(() => {
  var timeout = null
  window.addEventListener('scroll', () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      localStorage.setItem('scrolltop', document.body.scrollTop)
    }, 100)
  })
  document.body.scrollTop = parseInt(localStorage.getItem('scrolltop'))
}, 100))
