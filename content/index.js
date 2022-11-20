
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
  reload: {
    interval: null,
    ms: 1000,
    md: false,
  },
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
    clearInterval(state.reload.interval)
  }
})

var oncreate = {
  markdown: () => {
    scroll.body()
  },
  html: () => {
    update()
  },
  toc: () => {
    scroll.toc()
  }
}

var onupdate = {
  html: () => {
    if (state.reload.md) {
      state.reload.md = false
      update()
    }
  },
  toc: () => {
    scroll.toc()
  },
  theme: () => {
    if (state.content.mermaid) {
      setTimeout(() => mmd.render(), 0)
    }
  }
}

var update = () => {
  scroll.body()

  if (state.content.syntax) {
    setTimeout(() => Prism.highlightAll(), 20)
  }

  if (state.content.mermaid) {
    setTimeout(() => mmd.render(), 40)
  }

  if (state.content.mathjax) {
    setTimeout(() => mj.render(), 60)
  }
}

var render = (md) => {
  state.markdown = md
  chrome.runtime.sendMessage({
    message: 'markdown',
    compiler: state.compiler,
    markdown: state.markdown
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

  m.mount($('body'), {
    oninit: () => {
      render(md)
    },
    view: () => {
      var dom = []

      if (state.raw) {
        dom.push(m('pre#_markdown', {oncreate: oncreate.markdown}, state.markdown))
        $('body').classList.remove('_toc-left', '_toc-right')
      }
      else if (state.html) {
        var loaded = Array.from($('body').classList).filter((name) => /^_theme/.test(name))[0]
        $('body').classList.remove(loaded)
        dom.push(m('link#_theme', {
          onupdate: onupdate.theme,
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

        dom.push(m('#_html', {oncreate: oncreate.html, onupdate: onupdate.html,
          class: (/github(-dark)?/.test(state.theme) ? 'markdown-body' : 'markdown-theme') +
          (state.themes.width !== 'auto' ? ` _width-${state.themes.width}` : '')
        },
          m.trust(state.html)
        ))

        if (state.content.toc) {
          dom.push(m('#_toc.tex2jax-ignore', {oncreate: oncreate.toc, onupdate: onupdate.toc},
            m.trust(state.toc)
          ))
          $('body').classList.add('_toc-left')
        }
      }

      return dom
    }
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
        '<a href="#' + id + '">' + title + '</a>' +
        '</div>'.repeat(level)
      , '')
  }
})()

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
