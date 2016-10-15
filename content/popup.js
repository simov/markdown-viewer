
var state = {
  options: [],
  themes: [],
  theme: '',
  raw: false
}

var events = {
  changeOptions: (e) => {
    state.options[e.target.name] = !state.options[e.target.name]
    chrome.extension.sendMessage({
      message: 'options',
      options: state.options
    }, (res) => {})
  },

  changeTheme: (e) => {
    state.theme = state.themes[e.target.selectedIndex]
    chrome.extension.sendMessage({
      message: 'theme',
      theme: state.theme
    }, (res) => {})
  },

  viewRaw: () => {
    state.raw = !state.raw
    chrome.extension.sendMessage({
      message: 'raw',
      raw: state.raw,
      theme: state.theme
    }, (res) => {})
    return false
  },

  setDefaults: () => {
    chrome.extension.sendMessage({
      message: 'defaults'
    }, (res) => {
      chrome.extension.sendMessage({message: 'settings'}, init)
    })
    return false
  },

  advancedOptions: () => {
    chrome.extension.sendMessage({message: 'advanced'})
    return false
  }
}

function init (res) {
  state.options = res.options
  state.theme = res.theme

  state.themes = chrome.runtime.getManifest().web_accessible_resources
    .filter((file) => (file.indexOf('/themes/') === 0))
    .map((file) => (file.replace(/\/themes\/(.*)\.css/, '$1')))

  state.raw = res.raw
  m.redraw()
}

m.mount(document.querySelector('body'), {
  oninit: () => {
    chrome.extension.sendMessage({message: 'settings'}, init)
  },
  view: () =>
    m('#options', [
      m('a[href=""]', {onclick: events.viewRaw}, (state.raw ? 'Html' : 'Markdown')),
      m('a[href=""]', {onclick: events.setDefaults}, 'Defaults'),

      m('h4', 'Theme'),
      m('select', {onchange: events.changeTheme}, state.themes.map((theme) =>
        m('option', {selected: state.theme === theme}, theme)
      )),

      m('h4', 'Compiler Options'),
      m('ul', Object.keys(state.options).map((key) =>
        m('li',
          m('label',
            m('input[type="checkbox"]', {
              name: key,
              checked: state.options[key],
              onchange: events.changeOptions
            }),
            ' ' + key
          )
        )
      )),

      m('a[href=""]', {onclick: events.advancedOptions}, 'Advanced Options')
    ])
})
