
var Settings = () => {
  var defaults = {
    icon: 'default',
    theme: 'light',
    _icons: ['default', 'light', 'dark'],
    _themes: ['light', 'dark', 'auto'],
  }

  var state = Object.assign({}, defaults)

  chrome.runtime.sendMessage({message: 'options.settings'}, (res) => {
    Object.assign(state, res)
    document.querySelector('body').classList.add(state.theme)
    m.redraw()
  })

  var events = {
    icon: (e) => {
      state.icon = state._icons[e.target.selectedIndex]
      chrome.runtime.sendMessage({
        message: 'options.icon',
        settings: {
          icon: state.icon,
          theme: state.theme,
        },
      })
    },
    theme: (e) => {
      state.theme = state._themes[e.target.selectedIndex]
      chrome.runtime.sendMessage({
        message: 'options.theme',
        settings: {
          icon: state.icon,
          theme: state.theme,
        },
      })
      document.querySelector('body').classList.remove(...state._themes)
      document.querySelector('body').classList.add(state.theme)
    }
  }

  var oncreate = {}

  var onupdate = {}

  var render = () => [
    m('.row',
      m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
        m('span.m-label',
          'Extension Icon'
        )
      ),
      m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
        m('select.mdc-elevation--z2 m-select', {
          onchange: events.icon
          },
          state._icons.map((icon) =>
            m('option', {selected: state.icon === icon}, icon)
          )
        )
      ),
    ),
    m('.row',
      m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
        m('span.m-label',
          'Popup & Options Page'
        )
      ),
      m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
        m('select.mdc-elevation--z2 m-select', {
          onchange: events.theme
          },
          state._themes.map((theme) =>
            m('option', {selected: state.theme === theme}, theme)
          )
        )
      ),
    ),
  ]

  return {state, render}
}
