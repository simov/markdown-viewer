
var state = {
  compiler: '',
  options: {},
  content: {},
  theme: '',
  themes: [],
  custom: [],
  raw: false,
  tab: '',
  tabs: ['theme', 'compiler', 'content'],
  compilers: [],
  description: {
    compiler: {},
    content: {
      autoreload: 'Auto reload on file change',
      emoji: 'Convert emoji :shortnames: into EmojiOne images',
      scroll: 'Remember scroll position',
      toc: 'Generate Table of Contents',
      mathjax: 'Render MathJax formulas',
    }
  }
}

var events = {
  tab: (e) => {
    state.tab = e.target.hash.replace('#tab-', '')
    localStorage.setItem('tab', state.tab)
    return false
  },

  compiler: {
    name: (e) => {
      state.compiler = state.compilers[e.target.selectedIndex]
      chrome.runtime.sendMessage({
        message: 'popup.compiler.name',
        compiler: state.compiler,
      }, () => {
        chrome.runtime.sendMessage({message: 'popup'}, init)
      })
    },
    options: (e) => {
      state.options[e.target.name] = !state.options[e.target.name]
      chrome.runtime.sendMessage({
        message: 'popup.compiler.options',
        compiler: state.compiler,
        options: state.options,
      })
    }
  },

  content: (e) => {
    state.content[e.target.name] = !state.content[e.target.name]
    chrome.runtime.sendMessage({
      message: 'popup.content',
      content: state.content,
    })
  },

  theme: (e) => {
    var name = state.themes[e.target.selectedIndex]

    var defaults = chrome.runtime.getManifest().web_accessible_resources
      .filter((file) => file.indexOf('/themes/') === 0)
      .map((file) => file.replace(/\/themes\/(.*)\.css/, '$1'))

    state.theme = defaults.includes(name)
      ? {name, url: chrome.runtime.getURL(`/themes/${name}.css`)}
      : state.custom.find((theme) => theme.name === name)

    chrome.runtime.sendMessage({
      message: 'popup.theme',
      theme: state.theme
    })
  },

  raw: () => {
    state.raw = !state.raw
    chrome.runtime.sendMessage({
      message: 'popup.raw',
      raw: state.raw
    })
  },

  defaults: () => {
    chrome.runtime.sendMessage({
      message: 'popup.defaults'
    }, () => {
      chrome.runtime.sendMessage({message: 'popup'}, init)
      localStorage.removeItem('tab')
      state._tabs.activeTabIndex = 0
    })
  },

  advanced: () => {
    chrome.runtime.sendMessage({message: 'popup.advanced'})
  }
}

var init = (res) => {
  state.compiler = res.compiler
  state.options = res.options
  state.content = res.content
  state.theme = res.theme

  state.custom = res.themes
  state.themes = res.themes.map(({name}) => name).concat(
    chrome.runtime.getManifest().web_accessible_resources
      .filter((file) => file.indexOf('/themes/') === 0)
      .map((file) => file.replace(/\/themes\/(.*)\.css/, '$1')))

  state.raw = res.raw
  state.tab = localStorage.getItem('tab') || 'theme'
  state.compilers = res.compilers
  state.description.compiler = res.description

  m.redraw()
}

chrome.runtime.sendMessage({message: 'popup'}, init)

var oncreate = {
  ripple: (vnode) => {
    mdc.ripple.MDCRipple.attachTo(vnode.dom)
  },
  tabs: (vnode) => {
    state._tabs = mdc.tabs.MDCTabBar.attachTo(vnode.dom)
    setTimeout(() => {
      state._tabs.activeTabIndex = state.tabs.indexOf(state.tab)
    }, 250)
  }
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
      // raw
      m('button.mdc-button mdc-button--raised m-button', {
        oncreate: oncreate.ripple,
        onclick: events.raw
        },
        (state.raw ? 'Html' : 'Markdown')
      ),
      // defaults
      m('button.mdc-button mdc-button--raised m-button', {
        oncreate: oncreate.ripple,
        onclick: events.defaults
        },
        'Defaults'
      ),

      // tabs
      m('nav.mdc-tab-bar m-tabs', {
        oncreate: oncreate.tabs,
        onclick: events.tab
        },
        state.tabs.map((tab) =>
        m('a.mdc-tab', {
          href: '#tab-' + tab,
          },
          tab
        )),
        m('span.mdc-tab-bar__indicator')
      ),
      m('.m-panels',
        // theme
        m('.m-panel', {
          class: state.tab === 'theme' ? 'is-active' : ''
          },
          m('select.mdc-elevation--z2 m-select', {
            onchange: events.theme
            },
            state.themes.map((theme) =>
              m('option', {selected: state.theme.name === theme}, theme)
            )
          )
        ),
        // compiler
        m('.m-panel', {
          class: state.tab === 'compiler' ? 'is-active' : ''
          },
          m('select.mdc-elevation--z2 m-select', {
            onchange: events.compiler.name
            },
            state.compilers.map((name) =>
              m('option', {selected: state.compiler === name}, name)
            )
          ),
          m('.scroll', {
            class: Object.keys(state.options)
              .filter((key) => typeof state.options[key] === 'boolean')
              .length > 8
              ? 'max' : ''
            },
            Object.keys(state.options)
            .filter((key) => typeof state.options[key] === 'boolean')
            .map((key) =>
              m('label.mdc-switch m-switch', {
                onupdate: onupdate('compiler', key),
                title: state.description.compiler[key]
                },
                m('input.mdc-switch__native-control', {
                  type: 'checkbox',
                  name: key,
                  checked: state.options[key],
                  onchange: events.compiler.options
                }),
                m('.mdc-switch__background', m('.mdc-switch__knob')),
                m('span.mdc-switch-label', key)
              )
            )
          )
        ),
        // content
        m('.m-panel', {
          class: state.tab === 'content' ? 'is-active' : ''
          },
          m('.scroll', Object.keys(state.content).map((key) =>
            m('label.mdc-switch m-switch', {
              onupdate: onupdate('content', key),
              title: state.description.content[key]
              },
              m('input.mdc-switch__native-control', {
                type: 'checkbox',
                name: key,
                checked: state.content[key],
                onchange: events.content
              }),
              m('.mdc-switch__background', m('.mdc-switch__knob')),
              m('span.mdc-switch-label', key)
            ))
          )
        )
      ),

      // advanced options
      m('button.mdc-button mdc-button--raised m-button', {
        oncreate: oncreate.ripple,
        onclick: events.advanced
        },
        'Advanced Options'
      )
    )
})
