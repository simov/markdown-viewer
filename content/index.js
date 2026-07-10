
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

  setTimeout(() => copybuttons.render(), 30)

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
    markdown: frontmatter(state.markdown, state.content.frontmatter)
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

  m.mount($('body'), {
    oninit: () => {
      render(md)
    },
    view: () => {
      var dom = []

      if (state.html) {
        state._themes.custom = state.custom.color

        // a custom theme may extend a base theme; resolve the theme whose
        // stylesheet, color scheme and wrapper class should actually apply
        var effective = state.theme === 'custom' && state.custom.base
          ? state.custom.base
          : state.theme

        var color =
          state._themes[effective] === 'dark' ||
          (state._themes[effective] === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
          ? 'dark' : 'light'

        $('body').classList.remove(...Array.from($('body').classList).filter((name) => /^_theme|_color/.test(name)))
        dom.push(m('link#_theme', {
          onupdate: onupdate.theme,
          rel: 'stylesheet', type: 'text/css',
          href: effective !== 'custom' ? chrome.runtime.getURL(`/themes/${effective}.css`) : '',
        }))
        $('body').classList.add(`_theme-${effective}`, `_color-${color}`)

        state.content.codewrap
          ? $('body').classList.add('_code-wrap')
          : $('body').classList.remove('_code-wrap')

        if (state.content.syntax) {
          dom.push(m('link#_prism', {
            rel: 'stylesheet', type: 'text/css',
            href: chrome.runtime.getURL(`/vendor/${color === 'dark' ? 'prism-okaidia' : 'prism'}.min.css`),
          }))
        }

        var theme =
          (/github(-dark)?/.test(effective) ? 'markdown-body' : 'markdown-theme') +
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
        '<a href="#' + id + '">' + title.replace(/<a[^>]+>/g, '').replace(/<\/a>/g, '') + '</a>' +
        '</div>'.repeat(level)
      , '')
  }
})()

var copybuttons = (() => {
  var copied = (value) =>
    value.replace(/[\r\n]+$/, '')

  var text = (button, next) => {
    button.textContent = next
    clearTimeout(button._timeout)
    if (next !== 'Copy') {
      button._timeout = setTimeout(() => {
        button.textContent = 'Copy'
      }, 1500)
    }
  }

  var fallback = (value) => {
    var textarea = document.createElement('textarea')
    textarea.value = value
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.top = '-9999px'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    var ok = false
    try {
      ok = document.execCommand('copy')
    }
    catch (_) {}
    document.body.removeChild(textarea)
    return ok
  }

  var write = async (value) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(value)
        return true
      }
      catch (_) {}
    }
    return fallback(value)
  }

  var click = async (event) => {
    var button = event.currentTarget
    var value = button._code ? copied(button._code.textContent || '') : ''
    var ok = value && await write(value)
    if (ok) {
      button.classList.toggle('_copy-button-marked')
    }
    text(button, ok ? 'Copied' : 'Error')
  }

  var clear = (root) => {
    root.querySelectorAll('._copy-button').forEach((button) => button.remove())
    root.querySelectorAll('pre._copy-enabled').forEach((block) => block.classList.remove('_copy-enabled'))
  }

  return {
    render: () => {
      var root = document.querySelector('#_html')
      if (!root) {
        return
      }

      clear(root)

      if (state.raw || !state.content.copy) {
        return
      }

      root.querySelectorAll('pre > code:not(.mermaid)').forEach((code) => {
        var pre = code.parentElement
        if (!pre || pre.querySelector('._copy-button')) {
          return
        }

        pre.classList.add('_copy-enabled')

        var button = document.createElement('button')
        button.type = 'button'
        button.className = '_copy-button'
        button.textContent = 'Copy'
        button._code = code
        button.addEventListener('click', click)
        pre.insertBefore(button, pre.firstChild)
      })
    }
  }
})()

var frontmatter = (md, show) => {
  var yamlMatch = /^(-{3})([\s\S]+?)(-{3})/.exec(md)
  var tomlMatch = /^(\+{3})([\s\S]+?)(\+{3})/.exec(md)

  if (yamlMatch) {
    var [full, , content] = yamlMatch
    var title = /title: (?:'|")*(.*)(?:'|")*/.exec(content)
    title && (document.title = title[1])
    if (show) {
      return md.replace(full, '<div class="frontmatter">\n\n```yaml\n' + content.trim() + '\n```\n\n</div>\n\n')
    }
    return md.replace(full, '')
  }
  else if (tomlMatch) {
    var [full, , content] = tomlMatch
    var title = /title = (?:'|"|`)*(.*)(?:'|"|`)*/.exec(content)
    title && (document.title = title[1])
    if (show) {
      return md.replace(full, '<div class="frontmatter">\n\n```toml\n' + content.trim() + '\n```\n\n</div>\n\n')
    }
    return md.replace(full, '')
  }
  return md
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
