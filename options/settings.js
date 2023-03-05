
var Settings = () => {
  var defaults = {
    icon: false,
    theme: 'light',
    _icons: ['light', 'dark'],
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

  var render = () =>
    m('.m-settings hidden',
      m('.row',
        m('h3', 'Settings')
      ),
      // icon
      m('.bs-callout',
        m('.row',
          m('.col-sm-12',
            m('.overflow',
              m('label.mdc-switch',
                m('select.mdc-elevation--z2 m-select', {
                  onchange: events.icon
                  },
                  state._icons.map((icon) =>
                    m('option', {selected: state.icon === icon}, icon)
                  )
                ),
                m('span.mdc-switch-label',
                  'Extension Icon and Content Favicon Color'
                )
              )
            )
          )
        )
      ),
      // theme
      m('.bs-callout',
        m('.row',
          m('.col-sm-12',
            m('.overflow',
              m('label.mdc-switch',
                m('select.mdc-elevation--z2 m-select', {
                  onchange: events.theme
                  },
                  state._themes.map((theme) =>
                    m('option', {selected: state.theme === theme}, theme)
                  )
                ),
                m('span.mdc-switch-label',
                  'Popup and Options Page Color Mode'
                )
              )
            )
          )
        )
      )
    )

  return {state, render}
}
