
var $ = document.querySelector.bind(document)

var state = {
  theme: args.theme,
  raw: args.raw,
  themes: args.themes,
  content: args.content,
  compiler: args.compiler,
  custom: args.custom,
  icon: args.icon,
  html: '',
  markdown: '',
  toc: '',
  dragActive: false,
  isDocxMode: false,
  docxBuffer: null,
  reload: {
    interval: null,
    ms: 1000,
    md: false,
  },
  _themes: {
    'github': 'light',
    'github-dark': 'dark',
    'almond': 'light',
    // 'air': 'light',
    'awsm': 'light',
    'axist': 'light',
    'bamboo': 'auto',
    'bullframe': 'light',
    'holiday': 'auto',
    'kacit': 'light',
    'latex': 'light',
    'marx': 'light',
    'mini': 'light',
    'modest': 'light',
    'new': 'auto',
    'no-class': 'auto',
    'pico': 'auto',
    'retro': 'dark',
    'sakura': 'light',
    'sakura-vader': 'dark',
    'semantic': 'light',
    'simple': 'auto',
    // 'splendor': 'light',
    'style-sans': 'light',
    'style-serif': 'light',
    'stylize': 'light',
    'superstylin': 'auto',
    'tacit': 'light',
    'vanilla': 'auto',
    'water': 'light',
    'water-dark': 'dark',
    'writ': 'light',
    'custom': 'auto',
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
    state.reload.md = true
    m.redraw()
  }
  else if (req.message === 'autoreload') {
    clearInterval(state.reload.interval)
  }
})

var oncreate = {
  html: () => {
    update()
  }
}

var onupdate = {
  html: () => {
    if (state.reload.md) {
      state.reload.md = false
      update(true)
    }
  },
  theme: () => {
    if (state.content.mermaid) {
      setTimeout(() => mmd.render(), 0)
    }
  }
}

var update = (update) => {
  scroll(update)

  if (state.content.syntax) {
    setTimeout(() => Prism.highlightAll(), 20)
  }

  if (state.content.mermaid) {
    setTimeout(() => mmd.render(), 40)
  }

  if (state.content.mathjax) {
    setTimeout(() => mj.render(), 60)
  }

  setTimeout(() => addCopyButtons(), 80)
}

var addCopyButtons = () => {
  var preElements = document.querySelectorAll('#_html pre')
  preElements.forEach((pre) => {
    if (pre.querySelector('code.mermaid') || pre.querySelector('svg[id^=mermaid]')) {
      return
    }
    if (pre.querySelector('.markdown-copy-button')) {
      return
    }

    var button = document.createElement('button')
    button.className = 'markdown-copy-button'
    button.type = 'button'
    button.title = 'Copy code'
    button.setAttribute('aria-label', 'Copy code')

    button.innerHTML = `
      <svg class="copy-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      <svg class="check-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `

    button.addEventListener('click', () => {
      var codeElement = pre.querySelector('code')
      var text = codeElement ? codeElement.innerText : pre.innerText

      navigator.clipboard.writeText(text).then(() => {
        var copyIcon = button.querySelector('.copy-icon')
        var checkIcon = button.querySelector('.check-icon')
        copyIcon.style.display = 'none'
        checkIcon.style.display = 'inline'
        button.classList.add('copied')

        setTimeout(() => {
          copyIcon.style.display = 'inline'
          checkIcon.style.display = 'none'
          button.classList.remove('copied')
        }, 2000)
      }).catch((err) => {
        console.error('Failed to copy text: ', err)
      })
    })

    pre.appendChild(button)
  })
}

var render = (md) => {
  state.markdown = md
  chrome.runtime.sendMessage({
    message: 'markdown',
    compiler: state.compiler,
    markdown: frontmatter(state.markdown)
  }, (res) => {
    state.html = res.html
    if (state.content.emoji) {
      state.html = emojinator(state.html)
    }
    if (state.content.mermaid) {
      state.html = state.html.replace(
        /<code class="language-(?:mermaid|mmd)">/gi,
        '<code class="mermaid">'
      )
    }
    if (state.content.toc) {
      state.toc = toc.render(state.html)
    }
    state.html = anchors(state.html)
    m.redraw()
  })
}

function mount () {
  $('pre').style.display = 'none'
  var md = $('pre').innerText
  favicon()

  var dragCounter = 0

  window.addEventListener('dragenter', (e) => {
    e.preventDefault()
    dragCounter++
    if (dragCounter === 1) {
      state.dragActive = true
      m.redraw()
    }
  })

  window.addEventListener('dragover', (e) => {
    e.preventDefault()
  })

  window.addEventListener('dragleave', (e) => {
    e.preventDefault()
    dragCounter--
    if (dragCounter === 0) {
      state.dragActive = false
      m.redraw()
    }
  })

  window.addEventListener('drop', (e) => {
    e.preventDefault()
    dragCounter = 0
    state.dragActive = false
    m.redraw()

    var files = e.dataTransfer.files
    if (files.length === 0) return

    var file = files[0]
    var ext = file.name.split('.').pop().toLowerCase()

    document.title = file.name

    if (ext === 'docx') {
      var loadDocxScripts = () => {
        return new Promise((resolve) => {
          if (typeof docx !== 'undefined' && typeof JSZip !== 'undefined') {
            resolve()
            return
          }
          var loadJSZip = () => {
            return new Promise((r) => {
              var s = document.createElement('script')
              s.src = chrome.runtime.getURL('/vendor/jszip.min.js')
              s.onload = () => r()
              document.body.appendChild(s)
            })
          }
          var loadDocx = () => {
            return new Promise((r) => {
              var s = document.createElement('script')
              s.src = chrome.runtime.getURL('/vendor/docx-preview.min.js')
              s.onload = () => r()
              document.body.appendChild(s)
            })
          }
          loadJSZip().then(loadDocx).then(() => resolve())
        })
      }

      loadDocxScripts().then(() => {
        var reader = new FileReader()
        reader.onload = (event) => {
          state.isDocxMode = true
          state.docxBuffer = event.target.result
          m.redraw()
        }
        reader.readAsArrayBuffer(file)
      })
    } else {
      state.isDocxMode = false
      state.docxBuffer = null
      var reader = new FileReader()
      reader.onload = (event) => {
        render(event.target.result)
      }
      reader.readAsText(file)
    }
  })

  chrome.storage.local.get(['temporaryDocx'], (res) => {
    var isPreviewPage = window.location.pathname.endsWith('preview.html')
    if (isPreviewPage && res.temporaryDocx) {
      var binaryString = window.atob(res.temporaryDocx)
      var len = binaryString.length
      var bytes = new Uint8Array(len)
      for (var i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      state.isDocxMode = true
      state.docxBuffer = bytes.buffer
    }

    m.mount($('body'), {
      oninit: () => {
        if (!state.isDocxMode) {
          render(md)
        }
      },
      view: () => {
        var dom = []

        var color =
          state._themes[state.theme] === 'dark' ||
          (state._themes[state.theme] === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
          ? 'dark' : 'light'

        $('body').classList.remove(...Array.from($('body').classList).filter((name) => /^_theme|_color/.test(name)))
        dom.push(m('link#_theme', {
          onupdate: onupdate.theme,
          rel: 'stylesheet', type: 'text/css',
          href: state.theme !== 'custom' ? chrome.runtime.getURL(`/themes/${state.theme}.css`) : '',
        }))
        $('body').classList.add(`_theme-${state.theme}`, `_color-${color}`)

        if (state.isDocxMode) {
          $('body').classList.add('docx-mode')
          $('body').classList.remove('_toc-left', '_toc-right')

          dom.push(m('#_html', {
            oncreate: (vnode) => {
              vnode.dom.style.visibility = 'visible'
              if (state.docxBuffer) {
                vnode.dom.innerHTML = ''
                docx.renderAsync(state.docxBuffer, vnode.dom)
                  .then(() => console.log('DOCX rendered successfully'))
                  .catch(err => console.error('DOCX render error:', err))
              }
            }
          }))
        } else {
          $('body').classList.remove('docx-mode')
          if (state.html) {
            state._themes.custom = state.custom.color

            if (state.content.syntax) {
              dom.push(m('link#_prism', {
                rel: 'stylesheet', type: 'text/css',
                href: chrome.runtime.getURL(`/vendor/${color === 'dark' ? 'prism-okaidia' : 'prism'}.min.css`),
              }))
            }

            var theme =
              (/github(-dark)?/.test(state.theme) ? 'markdown-body' : 'markdown-theme') +
              (state.themes.width !== 'auto' ? ` _width-${state.themes.width}` : '')

            if (state.raw) {
              if (state.content.syntax) {
                dom.push(m('#_markdown', {oncreate: oncreate.html, onupdate: onupdate.html, class: theme},
                  m.trust(`<pre class="language-md"><code class="language-md">${_escape(state.markdown)}</code></pre>`)
                ))
              }
              else {
                dom.push(m('pre#_markdown', {oncreate: oncreate.html, onupdate: onupdate.html}, state.markdown))
              }
            }
            else {
              dom.push(m('#_html', {oncreate: oncreate.html, onupdate: onupdate.html, class: theme},
                m.trust(state.html)
              ))
            }

            if (state.content.toc) {
              dom.push(m('#_toc.tex2jax-ignore', m.trust(state.toc)))
              state.raw ? $('body').classList.remove('_toc-left') : $('body').classList.add('_toc-left')
            }

            if (state.theme === 'custom') {
              dom.push(m('style', {type: 'text/css'}, state.custom.theme))
            }
          }
        }

        dom.push(m('.dropzone-overlay', { class: state.dragActive ? 'active' : '' },
          m('.dropzone-box',
            m('svg.dropzone-icon', {
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round"
            },
              m('path', { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
              m('polyline', { points: "17 8 12 3 7 8" }),
              m('line', { x1: "12", y1: "3", x2: "12", y2: "15" })
            ),
            m('h2.dropzone-text', 'Drop .md or .docx file here'),
            m('p.dropzone-subtext', 'We will render it instantly in the browser')
          )
        ))

        return dom
      }
    })
  })
}

var anchors = (html) =>
  html.replace(/(<h[1-6] id="(.*?)">)/g, (header, _, id) =>
    header +
    '<a class="anchor" name="' + id + '" href="#' + id + '">' +
    '<span class="octicon octicon-link"></span></a>'
  )

var toc = (() => {
  var walk = (regex, string, group, result = [], match = regex.exec(string)) =>
    !match ? result : walk(regex, string, group, result.concat(!group ? match[1] :
      group.reduce((all, name, index) => (all[name] = match[index + 1], all), {})))
  return {
    render: (html) =>
      walk(
        /<h([1-6]) id="(.*?)">(.*?)<\/h[1-6]>/gs,
        html,
        ['level', 'id', 'title']
      )
      .reduce((toc, {id, title, level}) => toc +=
        '<div class="_ul">'.repeat(level) +
        '<a href="#' + id + '">' + title.replace(/<a[^>]+>/g, '').replace(/<\/a>/g, '') + '</a>' +
        '</div>'.repeat(level)
      , '')
  }
})()

var frontmatter = (md) => {
  if (/^-{3}[\s\S]+?-{3}/.test(md)) {
    var [, yaml] = /^-{3}([\s\S]+?)-{3}/.exec(md)
    var title = /title: (?:'|")*(.*)(?:'|")*/.exec(yaml)
    title && (document.title = title[1])
  }
  else if (/^\+{3}[\s\S]+?\+{3}/.test(md)) {
    var [, toml] = /^\+{3}([\s\S]+?)\+{3}/.exec(md)
    var title = /title = (?:'|"|`)*(.*)(?:'|"|`)*/.exec(toml)
    title && (document.title = title[1])
  }
  return md.replace(/^(?:-|\+){3}[\s\S]+?(?:-|\+){3}/, '')
}

var favicon = () => {
  var favicon = document.createElement('link')
  favicon.rel = 'icon'
  favicon.href = chrome.runtime.getURL(`/icons/${state.icon}/16x16.png`)
  $('head').appendChild(favicon)
}

var _escape = (str) =>
  str.replace(/[&<>]/g, (tag) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
  }[tag] || tag))

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
