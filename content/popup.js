
var state = {
  compiler: {},
  content: {},
  themes: [],
  theme: '',
  raw: false,
  tab: ''
}

var events = {
  changeTab: (e) => {
    state.tab = e.target.parentNode.hash.replace('#tab-', '')
    localStorage.setItem('tab', state.tab)
  },

  changeCompiler: (e) => {
    state.compiler[e.target.name] = !state.compiler[e.target.name]
    chrome.runtime.sendMessage({
      message: 'compiler',
      compiler: state.compiler
    })
  },

  changeContent: (e) => {
    state.content[e.target.name] = !state.content[e.target.name]
    chrome.runtime.sendMessage({
      message: 'content',
      content: state.content
    })
  },

  changeTheme: (e) => {
    state.theme = state.themes[e.target.selectedIndex]
    chrome.runtime.sendMessage({
      message: 'theme',
      theme: state.theme
    })
  },

  viewRaw: () => {
    state.raw = !state.raw
    chrome.runtime.sendMessage({
      message: 'raw',
      raw: state.raw
    })
  },

  setDefaults: () => {
    chrome.runtime.sendMessage({
      message: 'defaults'
    }, (res) => {
      chrome.runtime.sendMessage({message: 'settings'}, init)
      localStorage.removeItem('tab')
    })
  },

  advancedOptions: () => {
    chrome.runtime.sendMessage({message: 'advanced'})
  }
}

var description = {
  compiler: {
    gfm: 'Enable GFM\n(GitHub Flavored Markdown)',
    tables: 'Enable GFM tables\n(requires the gfm option to be true)',
    breaks: 'Enable GFM line breaks\n(requires the gfm option to be true)',
    pedantic: 'Don\'t fix any of the original markdown\nbugs or poor behavior',
    sanitize: 'Ignore any HTML\nthat has been input',
    smartLists: 'Use smarter list behavior\nthan the original markdown',
    smartypants: 'Use "smart" typographic punctuation\nfor things like quotes and dashes'
  },
  content: {
    scroll: 'Remember scroll position',
    toc: 'Generate Table of Contents'
  }
}

function init (res) {
  state.compiler = res.compiler
  state.content = res.content
  state.theme = res.theme

  state.themes = chrome.runtime.getManifest().web_accessible_resources
    .filter((file) => (file.indexOf('/themes/') === 0))
    .map((file) => (file.replace(/\/themes\/(.*)\.css/, '$1')))

  state.raw = res.raw
  state.tab = localStorage.getItem('tab') || 'compiler'
  m.redraw()
}

chrome.runtime.sendMessage({message: 'settings'}, init)

function oncreate (vnode) {
  componentHandler.upgradeElements(vnode.dom)
}
var onupdate = (tab, key) => (vnode) => {
  if (vnode.dom.classList.contains('is-checked') !== state[tab][key]) {
    vnode.dom.classList.toggle('is-checked')
  }
}

m.mount(document.querySelector('body'), {
  view: (vnode) =>
    m('#popup', [
      m('button.mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect',
        {oncreate, onclick: events.viewRaw},
        (state.raw ? 'Html' : 'Markdown')),
      m('button.mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect',
        {oncreate, onclick: events.setDefaults},
        'Defaults'),

      m('.mdl-tabs mdl-js-tabs mdl-js-ripple-effect', {oncreate},
        m('.mdl-tabs__tab-bar',
          m('a.mdl-tabs__tab', {href: '#tab-theme', class: 'is-active'}, 'Theme')
        ),
        m('.mdl-tabs__panel #tab-theme', {class: 'is-active'},
          m('select.mdl-shadow--2dp', {onchange: events.changeTheme}, state.themes.map((theme) =>
            m('option', {selected: state.theme === theme}, theme)
          ))
        )
      ),

      m('.mdl-tabs mdl-js-tabs mdl-js-ripple-effect', {oncreate},
        m('.mdl-tabs__tab-bar', {onclick: events.changeTab},
          m('a.mdl-tabs__tab', {href: '#tab-compiler',
            class: state.tab === 'compiler' ? 'is-active' : null}, 'Compiler'),
          m('a.mdl-tabs__tab', {href: '#tab-content',
            class: state.tab === 'content' ? 'is-active' : null}, 'Content')
        ),
        m('.mdl-tabs__panel #tab-compiler',
          {class: state.tab === 'compiler' ? 'is-active' : null},
          m('.mdl-grid', Object.keys(state.compiler).map((key) =>
            m('.mdl-cell',
              m('label.mdl-switch mdl-js-switch mdl-js-ripple-effect',
                {oncreate, onupdate: onupdate('compiler', key), title: description.compiler[key]}, [
                m('input[type="checkbox"].mdl-switch__input', {
                  name: key,
                  checked: state.compiler[key],
                  onchange: events.changeCompiler
                }),
                m('span.mdl-switch__label', key)
              ])
            )
          ))
        ),
        m('.mdl-tabs__panel #tab-content',
          {class: state.tab === 'content' ? 'is-active' : null},
          m('.mdl-grid', Object.keys(state.content).map((key) =>
            m('.mdl-cell',
              m('label.mdl-switch mdl-js-switch mdl-js-ripple-effect',
                {oncreate, onupdate: onupdate('content', key), title: description.content[key]}, [
                m('input[type="checkbox"].mdl-switch__input', {
                  name: key,
                  checked: state.content[key],
                  onchange: events.changeContent
                }),
                m('span.mdl-switch__label', key)
              ])
            )
          ))
        )
      ),

      m('button.mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect',
        {oncreate, onclick: events.advancedOptions},
        'Advanced Options')
    ])
})
