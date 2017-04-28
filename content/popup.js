
var state = {
  compiler: '',
  options: {},
  content: {},
  theme: '',
  themes: [],
  raw: false,
  tab: '',
  tabs: ['theme', 'compiler', 'content'],
  compilers: [],
  description: {
    compiler: {},
    content: {
      emoji: 'Convert emoji :shortnames: into EmojiOne images',
      scroll: 'Remember scroll position',
      toc: 'Generate Table of Contents'
    }
  }
}

var events = {
  tab: (e) => {
    state.tab = e.target.parentNode.hash.replace('#tab-', '')
    localStorage.setItem('tab', state.tab)
  },

  compiler: {
    name: (e) => {
      state.compiler = state.compilers[e.target.selectedIndex]
      chrome.runtime.sendMessage({
        message: 'compiler.name',
        compiler: state.compiler
      }, () => {
        chrome.runtime.sendMessage({message: 'settings'}, init)
      })
    },
    options: (e) => {
      state.options[e.target.name] = !state.options[e.target.name]
      chrome.runtime.sendMessage({
        message: 'compiler.options',
        compiler: state.compiler,
        options: state.options
      })
    }
  },

  content: (e) => {
    state.content[e.target.name] = !state.content[e.target.name]
    chrome.runtime.sendMessage({
      message: 'content',
      content: state.content
    })
  },

  theme: (e) => {
    state.theme = state.themes[e.target.selectedIndex]
    chrome.runtime.sendMessage({
      message: 'theme',
      theme: state.theme
    })
  },

  raw: () => {
    state.raw = !state.raw
    chrome.runtime.sendMessage({
      message: 'raw',
      raw: state.raw
    })
  },

  defaults: () => {
    chrome.runtime.sendMessage({
      message: 'defaults'
    }, () => {
      chrome.runtime.sendMessage({message: 'settings'}, init)
      localStorage.removeItem('tab')
    })
  },

  advanced: () => {
    chrome.runtime.sendMessage({message: 'advanced'})
  }
}

var init = (res) => {
  state.compiler = res.compiler
  state.options = res.options
  state.content = res.content
  state.theme = res.theme

  state.themes = chrome.runtime.getManifest().web_accessible_resources
    .filter((file) => (file.indexOf('/themes/') === 0))
    .map((file) => (file.replace(/\/themes\/(.*)\.css/, '$1')))

  state.raw = res.raw
  state.tab = localStorage.getItem('tab') || 'theme'
  state.compilers = res.compilers
  state.description.compiler = res.description

  m.redraw()
}

chrome.runtime.sendMessage({message: 'settings'}, init)

var oncreate = (vnode) => {
  componentHandler.upgradeElements(vnode.dom)
}
var onupdate = (tab, key) => (vnode) => {
  var value = tab === 'compiler' ? state.options[key]
    : tab === 'content' ? state.content[key]
    : null

  if (vnode.dom.classList.contains('is-checked') !== value) {
    vnode.dom.classList.toggle('is-checked')
  }
}

m.mount(document.querySelector('body'), {
  view: (vnode) =>
    m('#popup',
      // defaults
      m('button.mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect',
        {oncreate, onclick: events.raw},
        (state.raw ? 'Html' : 'Markdown')),
      m('button.mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect',
        {oncreate, onclick: events.defaults},
        'Defaults'),

      // tabs
      m('.mdl-tabs mdl-js-tabs mdl-js-ripple-effect', {oncreate},
        m('.mdl-tabs__tab-bar', {onclick: events.tab}, state.tabs.map((tab) =>
          m('a.mdl-tabs__tab', {
            href: '#tab-' + tab,
            class: state.tab === tab ? 'is-active' : ''
          }, tab))
        ),

        // theme
        m('.mdl-tabs__panel #tab-theme', {class: state.tab === 'theme' ? 'is-active' : ''},
          m('select.mdl-shadow--2dp', {onchange: events.theme}, state.themes.map((theme) =>
            m('option', {selected: state.theme === theme}, theme)
          ))
        ),

        // compiler
        m('.mdl-tabs__panel #tab-compiler', {class: state.tab === 'compiler' ? 'is-active' : ''},
          m('select.mdl-shadow--2dp', {onchange: events.compiler.name}, state.compilers.map((name) =>
            m('option', {selected: state.compiler === name}, name)
          )),
          m('.scroll', {class: Object.keys(state.options).length > 8 ? 'max' : ''},
            m('.mdl-grid', Object.keys(state.options || [])
              .filter((key) => typeof state.options[key] === 'boolean')
              .map((key) =>
              m('.mdl-cell',
                m('label.mdl-switch mdl-js-switch mdl-js-ripple-effect',
                  {oncreate, onupdate: onupdate('compiler', key),
                  title: state.description.compiler[key]},
                  m('input[type="checkbox"].mdl-switch__input', {
                    name: key,
                    checked: state.options[key],
                    onchange: events.compiler.options
                  }),
                  m('span.mdl-switch__label', key)
                )
              ))
            )
          )
        ),

        // content
        m('.mdl-tabs__panel #tab-content',
          {class: state.tab === 'content' ? 'is-active' : ''},
          m('.scroll',
            m('.mdl-grid', Object.keys(state.content).map((key) =>
              m('.mdl-cell',
                m('label.mdl-switch mdl-js-switch mdl-js-ripple-effect',
                  {oncreate, onupdate: onupdate('content', key), title: state.description.content[key]},
                  m('input[type="checkbox"].mdl-switch__input', {
                    name: key,
                    checked: state.content[key],
                    onchange: events.content
                  }),
                  m('span.mdl-switch__label', key)
                )
              )
            ))
          )
        )
      ),

      // advanced options
      m('button.mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect',
        {oncreate, onclick: events.advanced},
        'Advanced Options')
    )
})
